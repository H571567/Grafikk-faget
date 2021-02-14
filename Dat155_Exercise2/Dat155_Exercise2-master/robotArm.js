"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var colors = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


// Parameters controlling the size of the Robot's arm

var BASE_HEIGHT      = 2.0;
var BASE_WIDTH       = 5.0;
var LOWER_ARM_HEIGHT = 5.0;
var LOWER_ARM_WIDTH  = 0.5;
var UPPER_ARM_HEIGHT = 5.0;
var UPPER_ARM_WIDTH  = 0.5;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var Base = 0;
var LowerArm = 1;
var UpperArm = 2;
var left_finger1 = 3;
var left_finger2 = 4;
var right_finger1 = 5;
var right_finger2 = 6;

var theta= [ +70, 20, 120, -50, 60, 50 ,-60];

var selectedPart = 0;
var numOfParts = 7;
var BasePosX = 0, BasePosZ = 0;

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;

var highlightLoc;

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    colorCube();

    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    highlightLoc = gl.getUniformLocation(program, "highLight");

    console.log(highlightLoc);

    gl.uniform1i(highlightLoc,0);


    /*
    document.getElementById("slider1").onchange = function(event) {
        theta[0] = event.target.value;
    };
    document.getElementById("slider2").onchange = function(event) {
         theta[1] = event.target.value;
    };
    document.getElementById("slider3").onchange = function(event) {
         theta[2] =  event.target.value;
    };
    */

    document.addEventListener('keydown', function(event){
        switch (event.key) {
            case "ArrowDown":
                // code for "down arrow" key press.
                changePart(-1);
                break;
            case "ArrowUp":
                // code for "up arrow" key press.
                changePart(1);
                break;
            case "ArrowLeft":
                // code for "left arrow" key press.
                rotatePart(-1);
                break;
            case "ArrowRight":
                // code for "right arrow" key press.
                rotatePart(1);
                break;
            case "w":
                moveBase(1,0);
                break;
            case "s":
                moveBase(-1,0);
                break;
            case "a":
                moveBase(0,-1);
                break;
            case "d":
                moveBase(0,1);
                break;
            default:
                return; // Quit when this doesn't handle the key event.
        }
    });

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    render();
}

//----------------------------------------------------------------------------

function changePart(change){
    selectedPart += change;

    if(selectedPart <0){
        selectedPart = 0;
    } else if(selectedPart >numOfParts -1) {
        selectedPart = numOfParts-1;
    } else {
        //TODO: selected part changed, implement GUI update
    }
}

function rotatePart(change){

    theta[selectedPart] += change;

    if(selectedPart == 0) return; // if base allow full rotation
    var maxAngle = 180;// per task instruction

    if(selectedPart == 1) maxAngle = 90; // so the lower arm does not go through base

    if(theta[selectedPart] < -maxAngle){
        theta[selectedPart] = -maxAngle;
    } else if (theta[selectedPart] > maxAngle){
        theta[selectedPart] = maxAngle;
    }
}

function moveBase(X, Z){
    BasePosX+= X;
    BasePosZ += Z;
}

function drawCube(SCALE_X, SCALE_Y, SCALE_Z){
    var s = scale(SCALE_X, SCALE_Y, SCALE_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * SCALE_Y, 0.0 ), s);


    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t)   );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

var render = function() {

    var MVMStack = [];
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    modelViewMatrix = rotate(theta[0], vec3(0, 1, 0 ));
    modelViewMatrix = mult(modelViewMatrix, translate(BasePosX,0,BasePosZ));

    doHighlightPart(0);
    drawCube(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);//BASE

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArm], vec3(0, 0, 1 )));

    doHighlightPart(1);
    drawCube(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);//LOWER ARM

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_ARM_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], vec3(0, 0, 1)) );

    doHighlightPart(2);
    drawCube(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);//UPPER ARM


    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, UPPER_ARM_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(90, vec3(0, 1, 0)) ); // horizontal? claw


    MVMStack.push(modelViewMatrix); //Save MVM,Draw left
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[left_finger1], vec3(0, 0, 1)) );

    doHighlightPart(3);
    drawCube(UPPER_ARM_WIDTH/2, UPPER_ARM_HEIGHT/4, UPPER_ARM_WIDTH/2);//LEFT FINGER 1

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, UPPER_ARM_HEIGHT/4, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[left_finger2], vec3(0, 0, 1)) );

    doHighlightPart(4);
    drawCube(UPPER_ARM_WIDTH/2, UPPER_ARM_HEIGHT/4, UPPER_ARM_WIDTH/2);//LEFT FINGER 2

    modelViewMatrix = MVMStack.pop(); //Retrieve MVM, Draw Right
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[right_finger1], vec3(0, 0, 1)) );
    doHighlightPart(5);
    drawCube(UPPER_ARM_WIDTH/2, UPPER_ARM_HEIGHT/4, UPPER_ARM_WIDTH/2); //RIGHT FINGER 1


    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, UPPER_ARM_HEIGHT/4, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[right_finger2], vec3(0, 0, 1)) );

    doHighlightPart(6);
    drawCube(UPPER_ARM_WIDTH/2, UPPER_ARM_HEIGHT/4, UPPER_ARM_WIDTH/2); //RIGHT FINGER 2

    requestAnimationFrame(render);
}

function doHighlightPart(partNR){
    if (partNR == selectedPart){
        gl.uniform1i(highlightLoc,1);
    } else {
        gl.uniform1i(highlightLoc,0);
    }
}
