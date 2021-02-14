import MouseLookController from "./MouseLookController.js";
import {Vector3} from "../lib/three.module.js";

export default class Movement {
    constructor(camera, renderer, terrain) {
        this.camera = camera;
        this.terrain = terrain;
        /**
         * Set up camera controller:
         */

        this.mouseLookController = new MouseLookController(this.camera);

        // We attach a click lister to the canvas-element so that we can request a pointer lock.
        // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
        const canvas = renderer.domElement;

        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
        });

        this.yaw = 0.0;
        this.pitch = 0.0;
        this.mouseSensitivity = 0.001;


        document.addEventListener('pointerlockchange', (e) => {
            canvas.addEventListener('mousemove', (event) => {
                if (document.pointerLockElement === canvas){
                    this.yaw += event.movementX * this.mouseSensitivity;
                    this.pitch += event.movementY * this.mouseSensitivity;
                }

            }, false)
        }, false);

        this.move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            speed: 0.01
        };

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW') {
                this.move.forward = true;
                e.preventDefault();
            } else if (e.code === 'KeyS') {
                this.move.backward = true;
                e.preventDefault();
            } else if (e.code === 'KeyA') {
                this.move.left = true;
                e.preventDefault();
            } else if (e.code === 'KeyD') {
                this.move.right = true;
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW') {
                this.move.forward = false;
                e.preventDefault();
            } else if (e.code === 'KeyS') {
                this.move.backward = false;
                e.preventDefault();
            } else if (e.code === 'KeyA') {
                this.move.left = false;
                e.preventDefault();
            } else if (e.code === 'KeyD') {
                this.move.right = false;
                e.preventDefault();
            }
        });

        this.velocity = new Vector3(0.0, 0.0, 0.0);
    }
    doMove(frametime){
        const moveSpeed = this.move.speed * frametime;

        this.velocity.set(0.0, 0.0, 0.0);

        if (this.move.left) {
            this.velocity.x -= moveSpeed;
        }

        if (this.move.right) {
            this.velocity.x += moveSpeed;
        }

        if (this.move.forward) {
            this.velocity.z -= moveSpeed;
            /*
            let above = this.terrain.terrainGeometry.getHeightAt(this.camera.position.x, this.camera.position.z) <= this.camera.position.y-1;
            let below = this.terrain.terrainGeometry.getHeightAt(this.camera.position.x, this.camera.position.z) >= this.camera.position.y-1;

            if(above && below){
                this.velocity.z -= moveSpeed;
            }
            else if(above && !below){
                this.velocity.z -= moveSpeed;
                this.velocity.y -= 0.1;
            }
            else if(!above && below){
                this.velocity.z -= moveSpeed;
                this.velocity.y += 0.2;
            }

            /*if(terrainGeometry.getHeightAt(camera.position.x, camera.position.z) <= camera.position.y-1 &&
                terrainGeometry.getHeightAt(camera.position.x, camera.position.z) >= camera.position.y-1) {
                velocity.z -= moveSpeed;
            }
            else if(terrainGeometry.getHeightAt(camera.position.x, camera.position.z) <= camera.position.y-1) {
                velocity.y += 0.1;
            }
            else {
                velocity.y -= 0.1;
            }
            if(terrainGeometry.getHeightAt(camera.position.x, camera.position.z) >= camera.position.y+5) {
                velocity.z -= moveSpeed;
            }
            else{
                velocity.y -= 0.1;
            }*/

        }

        if (this.move.backward) {
            this.velocity.z += moveSpeed;
        }

        // update controller rotation.
        this.mouseLookController.update(this.pitch, this.yaw);


        // apply rotation to velocity vector, and translate moveNode with it.
        this.velocity.applyQuaternion(this.camera.quaternion);
        this.camera.position.add(this.velocity);

        this.yaw = 0;
        this.pitch = 0;
    }
}