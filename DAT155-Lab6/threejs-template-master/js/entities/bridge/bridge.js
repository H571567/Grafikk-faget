import {MeshPhongMaterial} from "../../lib/three.module.js";

export default class Bridge {

    constructor(loader,terrain) {
        this.loader = loader;
        this.loader.load(
            'js/entities/bridge/scene.gltf',
            function (gltf)  {
                let model = gltf.scene;
                model.scale.multiplyScalar(20);
                model.position.y = 15;
                model.position.z = 0;

                model.traverse( function (object ) {
                    if (object.isMesh) {
                        object.material = new MeshPhongMaterial();
                        object.material.color.set(0x692009);
                        object.castShadow = true;
                        object.recieveShadow = true;
                    }
                });
                terrain.mesh.add(model);
            }
        );
    }

}