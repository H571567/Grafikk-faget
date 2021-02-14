import Utilities from "../../lib/Utilities.js";
import {SimplexNoise} from "../../lib/SimplexNoise.js";
import TerrainBufferGeometry from "./TerrainBufferGeometry.js";
import {Color, Mesh, RepeatWrapping, TextureLoader} from "../../lib/three.module.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";

export default class Terrain {
    //mesh;
    constructor(heightmapImage, width) {
        /**
         * Add terrain:
         *
         * We have to wait for the image file to be loaded by the browser.
         * There are many ways to handle asynchronous flow in your application.
         * We are using the async/await language constructs of Javascript:
         *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
         */


        const simplex = new SimplexNoise();
        this.terrainGeometry = new TerrainBufferGeometry({
            width,
            heightmapImage,
            // noiseFn: simplex.noise.bind(simplex),
            numberOfSubdivisions: 128,
            height: 20
        });

        const grassTexture = new TextureLoader().load('./js/entities/terrain/textures/grass_01.jpg');
        grassTexture.wrapS = RepeatWrapping;
        grassTexture.wrapT = RepeatWrapping;
        grassTexture.repeat.set(5000 / width, 5000 / width);

        const snowyRockTexture = new TextureLoader().load('./js/entities/terrain/textures/grass_03.png');
        snowyRockTexture.wrapS = RepeatWrapping;
        snowyRockTexture.wrapT = RepeatWrapping;
        snowyRockTexture.repeat.set(1500 / width, 1500 / width);
        //snowyRockTexture.color = new Color(1.0,0.0,0.4);
        console.log(snowyRockTexture);

        const splatMap = new TextureLoader().load('./js/entities/terrain/images/splatmap_01.png');

        const terrainMaterial = new TextureSplattingMaterial({
            color: 0xffffff,
            shininess: 0,
            textures: [snowyRockTexture, grassTexture],
            splatMaps: [splatMap]
        });

        this.mesh = new Mesh(this.terrainGeometry, terrainMaterial);

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    add(child) {
        this.mesh.add(child);
    }
}