import {
    BoxGeometry,
    Mesh, MeshPhongMaterial, TextureLoader
} from "../../lib/three.module.js";

export default class BumpedCrate {

    constructor(scene) {

        let textureLoader = new TextureLoader();
        let crateTexture = textureLoader.load('js/entities/BumpedCrate/textures/crate0_diffuse.png');
        let crateBumpMap = textureLoader.load('js/entities/BumpedCrate/textures/crate0_bump.png');
        let crateNormalMap = textureLoader.load('js/entities/BumpedCrate/textures/crate0_normal.png');

        let crate = new Mesh(
            new BoxGeometry(3,3,3),
            new MeshPhongMaterial({
                color:0xffffff,
                map:crateTexture,
                bumpMap:crateBumpMap,
                normalMap:crateNormalMap
            })
        );

        scene.add(crate);
        crate.receiveShadow = true;
        crate.receiveShadow = true;
        crate.castShadow = true;
        return crate;
    };



}