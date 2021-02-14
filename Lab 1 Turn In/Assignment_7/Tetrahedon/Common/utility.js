"use strict";

(function () {

    window.getShaderSource = function (id) {
        return document.getElementById(id).textContent.replace(/^\s+|\s+$/g, '');
    };

    function createShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    window.createProgram = function (gl, vertexShaderSource, fragmentShaderSource) {
        const program = gl.createProgram();
        const vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        const fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        gl.attachShader(program, vshader);
        gl.deleteShader(vshader);
        gl.attachShader(program, fshader);
        gl.deleteShader(fshader);
        gl.linkProgram(program);

        let log = gl.getProgramInfoLog(program);
        if (log) {
            console.log(log);
        }

        log = gl.getShaderInfoLog(vshader);
        if (log) {
            console.log(log);
        }

        log = gl.getShaderInfoLog(fshader);
        if (log) {
            console.log(log);
        }

        return program;
    };
})();
