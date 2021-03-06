var bytes = [];
var arcProp = {};
var mySound;
var sound = false;
var songDuration, intervalChange, changeOnFrame, fileSize, byteCounter, arcRadius, tags;
var jsmediatags = window.jsmediatags;

var backgroundImage;
var myFont;
var myFXimg;

document.addEventListener("DOMContentLoaded", loadFileFromURL);

function loadFileFromURL() {
    alert('the fucking filename to load');
}


function setup() {
    backgroundImage = loadImage("assets/P5VizPageDesignBackground.png");
    //createCanvas(640, 480); //make panel to draw on in the site
    createCanvas(windowWidth, windowHeight);
    myFont = loadFont("assets/bgothl.ttf");
    myFXimg = loadImage("assets/vizpagedesignpostfx.png");
    
    
    byteCounter = 10000;
    frameRate();
    changeOnFrame = 60;
    arcRadius = 600;
}

function draw() {
    //background(0);

    background(backgroundImage);
    if(frameCount % changeOnFrame == (changeOnFrame - 1) && sound){
        readBlob(byteCounter, byteCounter += intervalChange);
        if(mySound.currentTime() == 0){
            sound = false;
        }
    }
    //uncomment for waveform not complete yet
    if(sound){
        noFill();
        stroke('rgba(0, 102, 255, 0.8)');
        strokeWeight(1.5);
        for (var i = 0; i < bytes.length; i++) { //cycle through bites and create the arc using the object properites
            arc(width/2, height/2, bytes[i].HAndW, bytes[i].HAndW, bytes[i].start, bytes[i].stop);
        }
        animateArcs();

        //draw it twice
        noFill();
        stroke('rgba(255, 51, 204, 0.3)');
        strokeWeight(2);
        for (var i = 0; i < bytes.length; i++) { //cycle through bites and create the arc using the object properites
            arc(width/2, height/2, bytes[i].HAndW *1.2, bytes[i].HAndW *1.2, bytes[i].start, bytes[i].stop);
        }
        animateArcs();

        var waveform = mySound.getPeaks();
        stroke('rgba(0,153,0,0.45)');
        strokeWeight(1);
        beginShape();
        for (var i = 0; i< waveform.length; i++){
            vertex(map(i, 0, waveform.length, 250, width - 250), map(waveform[i], -1, 1, height-390, 400)); //<------
        }
        endShape();

        drawCursor();
        stroke('rgba(0, 0, 0,0.48)');
        line(width/2 - 535, height/2, width/2 + 535, height/2);
        textSize(24);
        textAlign(RIGHT);
        fill('rgba(255,255,255,0.48)');
        textFont(myFont);
        text(tags.title, width/2 + 300, height/2);
        text(tags.artist, width/2 + 300, height/2 + 24);
    }
    tint(250, 30);
    image(myFXimg, 0, 0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mapValues(){ //map byte values to degrees and add to the arc properties then return the array with the arc properties
    var mappedValues = [];
    for (var i = 0; i < bytes.length; i++) {
        var m = map(bytes[i], 0, 9999999999, 0, 360);
        mappedValues[i] = m;
        mappedValues[i] = arcArray(mappedValues[i]);
    }
    return mappedValues;
}

function newFileRead(){
    var file = getFiles();
    fileSize = file.size - 1;

    mySound = loadSound(file, playMusic);
    readBlob(0, 10000, file);

    jsmediatags.read(file, {
        onSuccess: function(tag) {
            tags = tag.tags;
        }
    });
}

/////////////////////////////////////////////////////////////////////////
function readTextFile(files)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", files, false);
    // rawFile.onreadystatechange = function ()
    // {
    //     if(rawFile.readyState === 4)
    //     {
    //         if(rawFile.status === 200 || rawFile.status == 0)
    //         {
    //             var allText = rawFile.responseText;
    //             alert(allText);
    //         }
    //     }
    // }
    rawFile.send(null);
}

readTextFile("assets/Troublemaker (feat. Tumi).mp3");

//console.log(files);
/////////////////////////////////////////////////////////////////////////

function getFiles(){
    var files = document.getElementById('files').files;
    if(!files.length){
        alert('Please select a file!');
        return;
    }

    var file = files[0]

    return file;
}

function readBlob(opt_startByte, opt_stopByte, files) { //read file byte by byte on input change

    var file = files || getFiles();
    var start = parseInt(opt_startByte) || 0;
    var stop = parseInt(opt_stopByte) || file.size - 1;
    var i = 0;
    bytes = []; //clear array


    var reader = new FileReader();

    reader.onload = function(evt) { //when the reader loads the file read byte by byte and output as a string
        var placemark = 0, dv = new DataView(this.result), limit = dv.byteLength - 4, output;
        while( placemark <= limit ){
            output = dv.getUint32(placemark);  
            bytes[i] = output.toString(16);
            placemark += 4;
            i++;
        }
        bytes = mapValues(); //map values in bytes for arcs 
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsArrayBuffer(blob);
  }

function arcArray(bytesToBePlaced){ //get properties for the arc and return them to be placed in an array
    arcHeightAndWidth = random(0, arcRadius);
    arcStart = random(0, 360);
    if(arcStart + bytesToBePlaced >= 360){ //convert to radians and account set any stop values 361+ to 0+
        arcStop = (arcStart - 360) + bytesToBePlaced;
        arcStart = arcStart * (PI/180);
        arcStop = arcStop * (PI/180);
    } else { //just convert to radians and set arc stop
        arcStop = arcStart + bytesToBePlaced;
        arcStart = arcStart * (PI/180);
        arcStop = arcStop * (PI/180);
    }
    
    return arcProp = {HAndW:arcHeightAndWidth, start:arcStart, stop:arcStop} //return arc object properties
}

function animateArcs(){
    for (var i = 0; i < bytes.length; i++) {
        bytes[i].start += (1 * (PI/180));
        bytes[i].stop += (1 * (PI/180));
    }
}

function playMusic(){
    mySound.setVolume(1.0);
    mySound.play();
    songDuration = mySound.duration();
    intervalChange = fileSize / songDuration;
    sound = true;
}

function drawCursor() {
  noStroke();
  fill(0,255,0, 75);
  rect(map(mySound.currentTime(), 0, mySound.duration(), 250, width - 250), (height/2 - 150), 2, 300);
}