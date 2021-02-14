import {
    ImageUtils,
    PlaneGeometry,
    RepeatWrapping,
    ShaderMaterial,
    Mesh
} from "../../lib/three.module.js";

const vertShader = `
    uniform float uTime;
	varying vec2 vUV;
	varying vec3 WorldPosition;
	void main() {
	    vec3 pos = position;
	    pos.z += cos(pos.x*5.0+uTime) * 0.1 * sin(pos.y * 5.0 + uTime);
		WorldPosition = pos;
		vUV = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
	}`;

const fragShader = `
    #include <packing>
	varying vec2 vUV;
    uniform sampler2D uSurfaceTexture;
    uniform float uTime;

    void main(){
        vec4 color = vec4(1.0,0.0,1.0,0.3);
        vec2 pos = vUV * 2.0;
        pos.y -= uTime * 0.002;
        pos.x -= sin(uTime * 0.3) *0.01;
        vec4 WaterLines = texture2D(uSurfaceTexture,pos);
        color.rgba += WaterLines.r * 0.1;
        
        gl_FragColor = color;
    }`;

export default class Water3 {
    constructor(scene) {

        var waterLinesTexture = ImageUtils.loadTexture( './js/entities/water/WaterTexture.png' );
        waterLinesTexture.wrapS = waterLinesTexture.wrapT = RepeatWrapping;

        var uniforms = {
            uTime: { value: 0.0 },
            uSurfaceTexture: {type: "t", value:waterLinesTexture }
        };

        var water_geometry = new PlaneGeometry( 50, 50, 50, 50 );
        var water_material = new ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: vertShader,
            fragmentShader: fragShader,
            transparent:true,
            depthWrite:true
        } );
        var water = new Mesh( water_geometry, water_material );
        water.rotation.x = -Math.PI/2;

        water.uniforms = uniforms;
        water.material = water_material;

        this.water = water;
        water.position.setY(9);
        scene.add(water)

    }
    update () {
        this.water.uniforms.uTime.value += 0.03;

    }
}