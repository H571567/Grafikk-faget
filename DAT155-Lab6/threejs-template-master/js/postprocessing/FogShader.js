/**
 * Full-screen textured quad shader
 */

import {Vector3} from "../lib/three.module.js";

var FogShader = {

    uniforms: {

        "tDiffuse": { value: null },
        "opacity": { value: 1.0 },
        "cameraNear": {value: null},
        "cameraFar": {value: null},
        "tDepth": {value: null},
        "fogColor": {value: new Vector3(0.502, 0.0, 0.125)},
        "fogCap": {value: 0.9},
        "minFogThreshhold": {value: 0.5},
        "maxFogThreshhold": {value: 4.0}
    },

    vertexShader:
        `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,

    fragmentShader:
        `
        #include <packing>
        uniform float opacity;
        varying vec2 vUv;
        
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;
           
        uniform vec3 fogColor;
        uniform float fogCap;
        uniform float minFogThreshhold;
        uniform float maxFogThreshhold; 
          
        float readDepth( sampler2D depthSampler, vec2 coord ) {
            float fragCoordZ = texture2D( depthSampler, coord ).x;  
            float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
            return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        }
      
        void main() {
            vec4 texel = texture2D( tDiffuse, vUv );
            gl_FragColor = opacity * texel;
            float distance = 500.0 * readDepth(tDepth, vUv);
            float fogFactor = 0.0;
            if(distance > minFogThreshhold){ 
                float a = maxFogThreshhold - distance;   
                float b = maxFogThreshhold - minFogThreshhold;  
                float ff = (1.0 - (a / b));
                ff = clamp(ff, 0.0, 1.0);
                fogFactor = mix(0.0, fogCap, ff);
            }
            gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
        } 
        `
};

export { FogShader };
