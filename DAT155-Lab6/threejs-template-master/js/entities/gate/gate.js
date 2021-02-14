
export default class Gate {
    constructor(loader,terrain) {
        this.loader = loader;
        this.loader.load(
            'js/entities/gate/scene.gltf',
            function (gltf)  {
                let model = gltf.scene;
                model.scale.multiplyScalar(0.08);
                model.position.y = 10;

                model.traverse( function (object ) {
                    if (object.isMesh) {
                        object.material.color.set(0xffffff);
                        object.castShadow = true;
                        object.recieveShadow = true;
                        object.material.metalness = 0;
                    }
                });
                terrain.mesh.add(model);
            }
        );
    }
}