"use strict";

// Define rotation types
const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;

// Needed because of a GL callback for rendering
let view;

/**
 * Initialise webGL for the cube.
 */
class CubeGL {

    /**
     * Initialisation code.
     *
     * @param model
     */
    constructor(model) {
        this._model = model;
        this._axis = X_AXIS;

        let canvas = document.getElementById("gl-canvas");

        this.theta = [0, 0, 0];
        this.numVertices = 3/*vert per triangle*/*4/*sides*/;//36;

        let gl = canvas.getContext('webgl2');
        this._gl = gl;
        if (!gl) {
            alert("WebGL 2.0 isn't available");
        }

        let indices =
            [[0,2,3],
            [2,1,0],
            [1,2,3],
            [1,0,3]];
            /*[
            [1, 0, 3, 1, 3, 2],
            [2, 3, 7, 2, 7, 6],
            [3, 0, 4, 3, 4, 7],
            [6, 5, 1, 6, 1, 2],
            [4, 5, 6, 4, 6, 7],
            [5, 4, 0, 5, 0, 1]];*/

        let points = [];

        // triangulerer med farger
        let sideColors = [];
        for (let j = 0; j < 4; ++j) {
            for (let i = 0; i < 3; ++i) {
                points.push(this._model.vertices[indices[j][i]]);

                // for solid colored faces use i = 0
                sideColors.push(this._model.colors[j]);

            }
        }

        this._gl.viewport(0, 0, canvas.width, canvas.height);
        this._gl.clearColor(1.0, 1.0, 1.0, 1.0);

        this._gl.enable(this._gl.DEPTH_TEST);

        //
        //  Load shaders and initialize attribute buffers
        //
        let program = initShaders(this._gl, "./shaders/vshadercube.glsl", "./shaders/fshadercube.glsl");
        this._gl.useProgram(program);

        let cBuffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, cBuffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, flatten(sideColors), this._gl.STATIC_DRAW);

        let aColor = this._gl.getAttribLocation(program, "aColor");
        this._gl.vertexAttribPointer(aColor, 4, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(aColor);

        let vBuffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vBuffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, flatten(points), this._gl.STATIC_DRAW);


        let vPosition = this._gl.getAttribLocation(program, "vPosition");
        this._gl.vertexAttribPointer(vPosition, 4, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(vPosition);

        this.thetaLoc = this._gl.getUniformLocation(program, "theta");

        view = this;
        render();
    }

    /**
     * Update the cube.
     */
    update() {
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        this.theta[this._axis] += 2.0;
        this._gl.uniform3fv(this.thetaLoc, this.theta);
        this._gl.drawArrays(this._gl.TRIANGLES, 0, this.numVertices);
    }

    set axis(axis) {
        this._axis = axis;
    }

    get axis() {
        return this._axis;
    }

}

/**
 * Rendering function. In this example is this rendering function needed as callback from GL.
 */
function render() {
    view.update();
    requestAnimationFrame(render);
}
