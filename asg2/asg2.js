// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE =  `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Globals related to UI elements
let g_globalAngle = 0;
let g_leg1Angle=[20,20,20,20];
let g_leg2Angle=0;
let g_leg3Angle=0;
let g_animation=false;
let g_headAngle = 0;
let g_eyeSize = 0;
let g_shiftAnimation = false;

// Set up actions for the HTML UI elementss 
function addActionsForHtmlUI(){
  //Button Events (Shape Type)
  // document.getElementById('clearButton').onclick  = function() {g_shapesList = []; renderAllShapes();};

  document.getElementById('animateOnButton').onclick  = function() {g_animation=true;};
  document.getElementById('animateOffButton').onclick  = function() {g_animation=false;};

  // Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle=this.value; renderScene(); });
  document.getElementById('leg1Slide').addEventListener('mousemove', function() {for(var i =  0; i < g_leg1Angle.length; i++) g_leg1Angle[i]=this.value; renderAllShapes(); });
  document.getElementById('leg2Slide').addEventListener('mousemove', function() {g_leg2Angle=this.value; renderScene(); });
  document.getElementById('leg3Slide').addEventListener('mousemove', function() {g_leg3Angle=this.value; renderScene(); });
}

function main() {
  // Set up canvas and gl variable
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elementss
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev){if(ev.buttons == 1){click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.2, 0.1, 0.3, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // renderAllShapes();
  requestAnimationFrame(tick);
} 

function click(ev) {
  [x,y] = convertCoordinatesEventToGL(ev);
  
  if(ev.shiftKey){
    g_shiftAnimation = true;
  } else {
    g_globalAngle = x*360;
  }
}

function convertCoordinatesEventToGL(ev){ // Extract the event click and return it in WebGL coordinates
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/10000.0-g_startTime

// Called by browser repeatedly whenever its time
function tick(){
  // prinit some debug inifo so we know we're running
  g_seconds=performance.now()/1000.0-g_startTime;
  // console.log(g_seconds);

  // update Animation Angles
  updateAnimationAngle();

  // Draw Everythign
  renderScene();

  // Tell the browser to update aagain when it has time
  requestAnimationFrame(tick);

}

function updateAnimationAngle(){
  if(g_animation){
    for(var i = g_leg1Angle.length - 1; i > 0; i--){
      g_leg1Angle[i] = g_leg1Angle[i-1];
    }
    g_leg1Angle[0] = Math.abs((20*Math.sin(g_seconds)));
    g_leg2Angle = (30*Math.sin(g_seconds));
    g_leg3Angle = Math.abs(50*Math.sin(g_seconds));
  }
  if(g_shiftAnimation){
      g_headAngle = Math.abs(40*Math.sin(g_seconds));
      g_eyeSize = 0.1 + Math.random()/50;
      g_leg1Angle = [20,20,20,20];
      g_leg2Angle = Math.abs(45*Math.sin(g_seconds));
      g_leg3Angle = 45;
      if(g_headAngle < 5){
        g_shiftAnimation = false;
        g_headAngle = 0;
        g_eyeSize = 0;
      }
  }
}

// Draw every shape that is supposed to be in the canvas
function renderScene(){
  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw butt
  var butt = new Cube();
  butt.color = [.5,0,0.4,1.0];
  butt.matrix.translate(-0.2, -0.2, 0.4);
  butt.matrix.scale(0.4, 0.4, 0.4);
  butt.matrix.rotate(0,0,90,1);
  butt.render();

  // Web shooter
  var webButt = new Cone();
  webButt.color = [.5*.7,0,0.4*.7,1.0];
  webButt.matrix.translate(0, -0.2, 0.8);
  webButt.matrix.scale(0.2, 0.2, 0.2);
  webButt.matrix.rotate(0,0,45,1);
  webButt.render();

  // Web
  var web = new Cube();
  web.color = [1,1,1,1];
  web.matrix.translate(0,0,0.99);
  web.matrix.scale(0.01, 1.2, 0.01);
  web.render();
  
  // Draw body
  var body = new Cube();
  body.color = [.3,0,0.4,1.0];
  body.matrix.translate(-0.175, -0.175, -0.1);
  body.matrix.scale(0.35, 0.175, 0.5);
  body.render();

  // Draw 8 legs
  var legsList = [];
  var left = 1;
  for(let i = 7; i>=0; i--){
    if(i == 3){
      left = -1;
    }
    var leg1 = new Cube();
    leg1.color = [.3,0,0.4,1.0];
    leg1.matrix.scale(left,1, 1); // if left flip x axis
    leg1.matrix.translate(0.1,-0.1, -0.1 + ( (i%4)/8 ));
    leg1.matrix.rotate((i%4 + 1) * g_leg1Angle[i%4], 0, 0,  1);
    var leg1Mat = new Matrix4(leg1.matrix);
    leg1.matrix.scale(0.45,0.1, 0.1);
    legsList.push(leg1);
  
    var leg2 = new Cube();
    leg2.color = [.3,0,0.5,1.0];
    leg2.matrix = leg1Mat;
    leg2.matrix.translate(0.401,0.05, 0.01);
    leg2.matrix.rotate(-90, 0, 0,  1);
    leg2.matrix.rotate(g_leg2Angle, 0, 0,  1);
    var leg2Mat = new Matrix4(leg2.matrix);
    leg2.matrix.scale(0.52,0.05, 0.08);
    legsList.push(leg2);
  
    var leg3 = new Cube();
    leg3.color = [.3,0,0.6,1.0];
    leg3.matrix = leg2Mat;
    leg3.matrix.translate(0.501,0.02, 0.01);
    leg3.matrix.rotate(-90, 0, 0,  1);
    leg3.matrix.rotate(g_leg3Angle, 0, 0,  1);
    leg3.matrix.scale(0.4,0.02, 0.06);
    legsList.push(leg3);
  }
  for(let i = legsList.length-1; i>=0; i--){
    legsList[i].render();
  }

  // Draw head
  var head = new Cube();
  head.color = [.3,0,0.45,1.0];
  head.matrix.translate(-0.15, -0.15, -0.401);
  head.matrix.scale(0.3, 0.3, 0.3);
  head.matrix.rotate(g_headAngle,0,0,1);
  var headMat = new Matrix4(head.matrix);
  head.render();

  // Draw fang cones
  var fang1 = new Cone();
  fang1.color = [1,1,1,1];
  fang1.matrix = new Matrix4(headMat);
  fang1.matrix.translate(0.2, 0, 0.25);
  fang1.matrix.rotate(90,-90,0,1);
  fang1.matrix.scale(0.1, 0.1, -0.3);
  fang1.render();

  var fang2 = new Cone();
  fang2.color = [1,1,1,1];
  fang2.matrix = new Matrix4(headMat);
  fang2.matrix.translate(0.8, 0, 0.25);
  fang2.matrix.rotate(90,-90,0,1);
  fang2.matrix.scale(0.1, 0.1, -0.3);
  fang2.render();

  // Draw eyes
  var eye1 = new Cone();
  eye1.color = [0,0.7,0.8,1.0];
  eye1.matrix = new Matrix4(headMat);
  eye1.matrix.translate(0.35, 0.3, -0.05);
  eye1.matrix.scale(0.15, 0.15 + g_eyeSize, 0.15);
  eye1.render();

  var eye2 = new Cone();
  eye2.color = [0,0.7,0.8,1.0];
  eye2.matrix = new Matrix4(headMat);
  eye2.matrix.translate(0.65, 0.3, -0.05);
  eye2.matrix.scale(0.15, 0.15 + g_eyeSize, 0.15);
  eye2.render();

  var eye3 = new Cone();
  eye3.color = [0,0.7,0.8,1.0];
  eye3.matrix = new Matrix4(headMat);
  eye3.matrix.translate(0.15, 0.5, -0.05);
  eye3.matrix.scale(0.1, 0.1 + g_eyeSize, 0.1);
  eye3.render();

  var eye4 = new Cone();
  eye4.color = [0,0.7,0.8,1.0];
  eye4.matrix = new Matrix4(headMat);
  eye4.matrix.translate(0.85, 0.5, -0.05);
  eye4.matrix.scale(0.1, 0.1 + g_eyeSize, 0.1);
  eye4.render();

  var eye5 = new Cone();
  eye5.color = [0,0.7,0.8,1.0];
  eye5.matrix = new Matrix4(headMat);
  eye5.matrix.translate(-0.05, 0.5, 0.4);
  eye5.matrix.scale(0.1, 0.1 + g_eyeSize, 0.1);
  eye5.matrix.rotate(90,0,45,1);
  eye5.render();

  var eye6 = new Cone();
  eye6.color = [0,0.7,0.8,1.0];
  eye6.matrix = new Matrix4(headMat);
  eye6.matrix.translate(1.05, 0.5, 0.4);
  eye6.matrix.scale(0.1, 0.1 + g_eyeSize, 0.1);
  eye6.matrix.rotate(90,0,-45,1);
  eye6.render();

  var eye7 = new Cone();
  eye7.color = [0,0.7,0.8,1.0];
  eye7.matrix = new Matrix4(headMat);
  eye7.matrix.translate(-0.05, 0.3, 0.2);
  eye7.matrix.scale(0.15, 0.15 + g_eyeSize, 0.15);
  eye7.matrix.rotate(90,0,45,1);
  eye7.render();

  var eye8 = new Cone();
  eye8.color = [0,0.7,0.8,1.0];
  eye8.matrix = new Matrix4(headMat);
  eye8.matrix.translate(1.05, 0.3, 0.2);
  eye8.matrix.scale(0.15, 0.15 + g_eyeSize, 0.15);
  eye8.matrix.rotate(90,0,-45,1);
  eye8.render();
}