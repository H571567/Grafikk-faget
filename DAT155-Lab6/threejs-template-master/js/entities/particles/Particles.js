
import {
    AdditiveBlending, AmbientLight,
    BufferGeometry, Color,
    Float32BufferAttribute, Points,
    ShaderMaterial,
    TextureLoader, Vector3
} from "../../lib/three.module.js";

const _VS = `
uniform float pointMultiplier;
attribute float size;
attribute float angle;
attribute vec4 colour;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;
  vAngle = vec2(cos(angle), sin(angle));
  vColour = colour;
}`;

const _FS = `
uniform sampler2D diffuseTexture;
varying vec4 vColour;
varying vec2 vAngle;
void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}`;

/////////////////////////////////////////////////////////////////////


export default class ParticleSystem {
    constructor(params, camera) {

        this._particles = [];
        this._camera = camera;

        const uniforms = {
            diffuseTexture: {
                value: new TextureLoader().load('./js/entities/particles/particle.jpg')
            },
            pointMultiplier: {
                value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
            }
        };

        this._material = new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: _VS,
            fragmentShader: _FS,
            blending: AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });


        this._geometry = new BufferGeometry();
        this._geometry.setAttribute('position', new Float32BufferAttribute([], 3));
        this._geometry.setAttribute('size', new Float32BufferAttribute([], 1));
        this._geometry.setAttribute('colour', new Float32BufferAttribute([], 4));
        this._geometry.setAttribute('angle', new Float32BufferAttribute([], 1));

        this._points = new Points(this._geometry, this._material);

        params.parent.add(this._points);

        this._AddParticles();
        this._UpdateGeometry();

    }

    _AddParticles() {
        for (let i = 0; i < 2; i++) {
            const life = (Math.random() * 1000 + 0.25) * 10.0;
            this._particles.push({
                position: new Vector3(
                    (Math.random() * 100 - 50) * 1.0,
                    (Math.random() * 25 - 5) * 1.0,
                    (Math.random() * 100 - 50) * 1.0),
                size: 0.8,
                colour: new Color(0.0, 0.7, 1.0),
                alpha: 1.0,
                life: life,
                maxLife: life,
                rotation: Math.random() * 2.0 * Math.PI,
                brightness: 10.0
            });
        }
    }

    _UpdateGeometry() {
        const positions = [];
        const sizes = [];
        const colours = [];
        const angles = [];

        for (let p of this._particles) {
            positions.push(p.position.x, p.position.y, p.position.z);
            colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
            sizes.push(p.size);
            angles.push(p.rotation);
        }

        this._geometry.setAttribute(
            'position', new Float32BufferAttribute(positions, 3));
        this._geometry.setAttribute(
            'size', new Float32BufferAttribute(sizes, 1));
        this._geometry.setAttribute(
            'colour', new Float32BufferAttribute(colours, 4));
        this._geometry.setAttribute(
            'angle', new Float32BufferAttribute(angles, 1));

        this._geometry.attributes.position.needsUpdate = true;
        this._geometry.attributes.size.needsUpdate = true;
        this._geometry.attributes.colour.needsUpdate = true;
        this._geometry.attributes.angle.needsUpdate = true;
    }

    _UpdateParticles(timeElapsed) {
        for (let p of this._particles) {
            p.life -= timeElapsed;
        }

        this._particles = this._particles.filter(p => {
            return p.life > 0.0;
        });

        for (let p of this._particles) {
            p.rotation += timeElapsed * 1.0;
        }


        /**
        this._particles.sort((a, b) => {
            const d1 = this._camera.position.distanceToSquared(a.position);
            const d2 = this._camera.position.distanceToSquared(b.position);

            if (d1 > d2) {
                return -1;
            }

            if (d1 < d2) {
                return 1;
            }

            return 0;
        });
         */
    }

    Step(timeElapsed) {
        this._UpdateParticles(timeElapsed);
        this._UpdateGeometry();

        wait();

        this._AddParticles();
        this._UpdateGeometry();
    }



}
const delay = ms => new Promise(res => setTimeout(res, ms));
const wait = async () => {
    await delay(5000);
};
