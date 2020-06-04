let song, analyzer;
let r, g, b;
let fft, button, canvas, container;
let fadeTimer;
var divisions, range, maxRad;

function preload() {
  sound = loadSound('songtest.mp3');
}

function buttonDown(){
  container.className = "soundOn";
  // Start drawing in the canvas
  loop();
  clearTimeout(fadeTimer);
  
  if(!sound.isPlaying()){
      //Stop duplicate tracks playing
    sound.play()
  }
  sound.setVolume(1, 1)
}

function buttonUp(){
  // One second fade out on the volume once button is released 
  if(sound.isPlaying()){
    sound.setVolume(0, 1)
    fadeTimer = setTimeout(function() {
      //Stop the sound once it's finished fading out
      sound.stop();
      container.className = "";
      //stop canvas draw function and clear it.
      noLoop();
    }, 1200)
  }
}


function setup() {
 
  container = document.getElementById('haptic');
  button = document.getElementById('hapticPlay');

  divisions = 180;
  range = 20000 / divisions;
  maxRad = 200;


  button.addEventListener('mousedown', e => {
    buttonDown()
  });

  window.addEventListener('mouseup', e => {
    buttonUp();
  });
  
  canvas = createCanvas(window.innerWidth, 642);
  canvas.parent('haptic')

  sound.loop();
  sound.pause();

  // create a new Amplitude analyzer
  analyzer = new p5.Amplitude();

  // Patch the input to an volume analyzer
  analyzer.setInput(sound);
  
  fft = new p5.FFT();
  fft.setInput(sound);
  
  frameRate(20);
  angleMode(DEGREES)  

  noLoop();
}

function draw() {
  clear();

  // Get the average (root mean square) amplitude
  fill(255, 255, 255, 100);

  let spectrum = fft.analyze();  

  translate (width / 2, height / 2);
  rotate(45);
  for (var i = 0; i < divisions; i++){
    //var bottom = Math.floor(i * (16000/points)) + 1;
    //var top = (i+1) * Math.floor((16000/points));
    //var amp = fft.getEnergy(bottom, top);
    var bottom = Math.floor(range * i) + 1
    var top =  Math.floor(range * (i+1))


    var amp = fft.getEnergy(bottom, top);

    var r = map(amp, 0, 255, 0, maxRad);
    rotate( (270 / divisions) );
    strokeWeight(1);
    // Draw the red lines

    stroke('rgba(255,255,255,0.4)');
    line( 0, 116, 0, 120 + r );

    var red = map(i, 0, divisions, 0 , 1);
    stroke('rgba(255, 0, 0, '+red+')');
    line( 0, 116, 0, 120 + r );
  }

  //Draw the tachometer bar
  var power = analyzer.getLevel();
  console.log(power)
  var theta = map(power, 0, 1, 90, 315);
  rotate(theta);
  stroke('rgba(255,255,255,1)');
  strokeWeight(2);
  line( 0, 90, 0, 110 );
}