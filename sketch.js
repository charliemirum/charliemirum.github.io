let song, analyzer;
let r, g, b;
let fft, button, canvas, container;
let fadeTimer;
let ampArray = [];
let divisions, range, maxRad;

function preload() {
  sound = loadSound('/audio/DBX.wav');
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
    }, 1800)
  }
}


function setup() {
 
  container = document.getElementById('haptic');
  button = document.getElementById('hapticPlay');

  //Number of  lines to draw
  divisions = 180;
  //Range of frequency to analyze (Max 24000)
  range = 20000 / divisions;
  //Maximum length of outward radiating lines
  maxRad = 200;

  smooth(1)

  button.addEventListener('mousedown', e => {
    buttonDown()
  });

  window.addEventListener('mouseup', e => {
    buttonUp();
  });
  
  canvas = createCanvas(window.innerWidth, 642);
  canvas.parent('haptic')

  //sound.loop();
  sound.pause();

  // create a new Amplitude analyzer
  analyzer = new p5.Amplitude();

  // Patch the input to an volume analyzer
  analyzer.setInput(sound);
  
  fft = new p5.FFT();
  fft.setInput(sound);
  
  frameRate(20);
  angleMode(DEGREES)  

  //Prevent the draw loop from running the whole time
  noLoop();
}

function draw() {
  //Clear the previous frame
  clear();
  //Starts the analyzer on the sound. 
  let spectrum = fft.analyze();  

  translate (width / 2, height / 2);
  rotate(45);
  for (var i = 0; i < divisions; i++){

    //Calculate the amplitude for a frequency range
    var bottom = Math.floor(range * i) + 1
    var top =  Math.floor(range * (i+1))
    var amp = fft.getEnergy(bottom, top);
    
    // r is distance to radiate from center, based on amplitude of that range.
    var r = map(amp, 0, 255, 0, maxRad);
    
    //Space out the lines
    rotate( (270 / divisions) );
    strokeWeight(1);
    
    // Draw white lines as base
    stroke('rgba(255,255,255,0.4)');
    line( 0, 116, 0, 120 + r );
    // Draw the red lines
    var red = map(i, 0, divisions, 0 , 1);
    stroke('rgba(255, 0, 0, '+red+')');
    line( 0, 116, 0, 120 + r );
  }

  //Draw the tachometer bar
  var power = analyzer.getLevel();

  //Average power over 15 or so frames to smooth the motion of the tachometer bar.
  var total = 0;
  ampArray.push(power);
  if(ampArray.length > 15){
    ampArray.shift()
  }
  for(var i = 0; i < ampArray.length; i++) {
    total += ampArray[i];
  }
  var ampAvg = total / ampArray.length;

  var theta = map(ampAvg, 0, .9, 90, 360, true);
  rotate(theta);
  stroke('rgba(255,255,255,1)');
  strokeWeight(2);
  line( 0, 90, 0, 110 );
}