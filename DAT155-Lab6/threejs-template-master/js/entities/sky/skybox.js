import {CubeTextureLoader} from "../../lib/three.module.js";
import {Mesh, CubeGeometry, DoubleSide, MeshBasicMaterial, MeshFaceMaterial, TextureLoader} from "../../lib/three.module.js";
import {ShaderMaterial, SphereGeometry} from "../../lib/three.module.js";


export default class SkyBox {
    constructor(scene) {

            scene.background = new CubeTextureLoader()
                .setPath('js/entities/sky/skybox1/')
                .load([
                    'right.png',
                    'left.png',
                    'top.png',
                    'bottom.png',
                    'front.png',
                    'back.png'
                ]);
    }
}