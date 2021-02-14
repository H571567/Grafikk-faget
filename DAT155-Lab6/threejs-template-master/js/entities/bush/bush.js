import {Sprite, SpriteMaterial} from "../../lib/three.module.js";
import {TextureLoader} from "../../lib/three.module.js";
import {Vector3} from "../../lib/three.module.js";

export default class Bush {
    constructor(scene,terrain) {
        let loader = new TextureLoader();
        let texture = loader.load('js/entities/bush/textures/n_grass_diff_0_01.png');
        let material = new SpriteMaterial({
            map:texture,
            transparent: true,
            color: 0xffffff,
            depthWrite: false
        });
        let texture1 = loader.load('js/entities/bush/textures/n_grass_diff_0_31.png');
        let material1 = new SpriteMaterial({
            map:texture1,
            transparent: true,
            color: 0xffffff,
            depthWrite: false
        });

        let grassList = [];
        let grass;
        for(let i=0; i< 200; i++){
            let mindist = 20;
            let r1 = Math.random(); //random point between 0 and 1
            let r2 = Math.random();
            let r3 = Math.random();
            //random radius between mindist and 2* mindist
            let  radius = mindist * (r1 + 1);
            //random angle
            let  angle1 = 2 * Math.PI * r2;
            let  angle2 = 2 * Math.PI * r3;
            //the new point is generated around the point (x, y, z)
            let point = new Vector3()
            let  newX = point.x + radius * Math.cos(angle1) * Math.sin(angle2);
            let  newZ = point.z + radius * Math.cos(angle2);
            let pos = new Vector3(newX, terrain.terrainGeometry.getHeightAt(newX, newZ)+0.5,newZ );
            let ran = Math.random();

            if(ran <= 0.8){
                grass = new Sprite(material);
            }
            else{
                grass = new Sprite(material1);
            }
            if(pos.y <= 9.5){
                i--;
                continue;
            }
            grass.position.copy(pos);
            grassList[i] = grass;
            terrain.mesh.add(grass);
        }
    }
}