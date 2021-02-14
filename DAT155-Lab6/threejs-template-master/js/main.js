import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    Vector3,
    sRGBEncoding,
    WebGLRenderTarget,
    RGBFormat,
    DepthTexture,
    UnsignedShortType,
    NearestFilter,
    AmbientLight,
    PointLight,
    PointLightHelper,

} from './lib/three.module.js';
import Utilities from './lib/Utilities.js';
import ParticleSystem from "./entities/particles/Particles.js";
import { GLTFLoader } from './lib/loaders/GLTFLoader.js';
import Terrain from "./entities/terrain/Terrain.js";
import Movement from "./controls/Movement.js";
import {EffectComposer} from "./postprocessing/EffectComposer.js";
import {RenderPass} from "./postprocessing/RenderPass.js"
import {HalftonePass} from "./postprocessing/HalftonePass.js";
import {ShaderPass} from "./postprocessing/ShaderPass.js";
import Gate from "./entities/gate/gate.js";
import Bridge from "./entities/bridge/bridge.js";
import {FogShader} from "./postprocessing/FogShader.js";
import SkyBox from "./entities/sky/skybox.js";
import Bush from "./entities/bush/bush.js";
import Sakura from "./entities/sakura/sakura.js";
import BumpedCrate from "./entities/BumpedCrate/bumpedCrate.js";
import Water3 from "./entities/water/Water3.js";



async function main() {

    const scene = new Scene();

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    camera.position.y = 13;
    camera.rotation.x -= Math.PI * 0.25;


    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.outputEncoding = sRGBEncoding;

    /**
     * Handle window resize:
     *  - update aspect ratio.
     *  - update projection matrix
     *  - update renderer size
     *  - update composer size
     *  - update renderDepth-renderTarget
     */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize( window.innerWidth, window.innerHeight );
        const dpr = renderer.getPixelRatio();
        depthRender.setSize( window.innerWidth * dpr, window.innerHeight * dpr );
    }, false);

    /**
     * Add canvas element to DOM.
     */
    document.body.appendChild(renderer.domElement);

    /**
     * Ambient light
     */
    let ambientLight = new AmbientLight(0x1a1a00,0.5);
    scene.add(ambientLight);

    /**
     * Point light
     */
    const pointLight = new PointLight(0xffffff, 1.0, 100);
    pointLight.position.y = 35;
    pointLight.castShadow = true;

    //Set up shadow properties for the light
    pointLight.shadow.mapSize.width = 512;
    pointLight.shadow.mapSize.height = 512;
    pointLight.shadow.camera.near = 0.5;
    pointLight.shadow.camera.far = 2000;
    scene.add(pointLight);

    /**
     * Shows the position of the point light
     */
    const pointLightHelper = new PointLightHelper( pointLight, 1 );
    scene.add( pointLightHelper );

    /**
     * Terrain
     */
    const heightmapImage =  await Utilities.loadImage('js/entities/terrain/images/heightmap2.png');
    const terrain = new Terrain(heightmapImage, 100);
    scene.add(terrain.mesh);

    /**
     * Skybox
     */
    new SkyBox(scene);


    /**
     * Instantiation of models
     */
    const loader = new GLTFLoader();
    new Gate(loader, terrain);
    new Bridge(loader,terrain);
    new Bush(scene,terrain);
    new Sakura(scene,terrain);
    let myCrate = new BumpedCrate(terrain);
    myCrate.position.set(15,14,22);

    /**
     * Movement
     */
    let player = new Movement(camera, renderer, terrain);

    /**
     * Water
     */
    let water = new Water3(terrain);

    /**
     * Lightparticles
     */
    let lightParticle = new ParticleSystem({
        parent: scene,
        camera: camera
    });

    /**
     * Post-prosessering
     */



    /**
     * Set up halftone effect
     */
    const params = {
        shape: 2,
        radius: 2,
        rotateR: Math.PI / 12,
        rotateB: Math.PI / 12 * 2,
        rotateG: Math.PI / 12 * 3,
        scatter: 0,
        blending: 0.4,
        blendingMode: 1,
        greyscale: false,
        disable: false
    };

    const halftonePass = new HalftonePass( window.innerWidth, window.innerHeight, params );

    /**
     * set up depthRenderTarget and fog effect
     */
    let depthRender = new WebGLRenderTarget(window.innerWidth, window.innerHeight);
    depthRender.texture.format = RGBFormat;
    depthRender.texture.minFilter = NearestFilter;
    depthRender.texture.magFilter = NearestFilter;
    depthRender.texture.generateMipmaps = false;
    depthRender.stencilBuffer = false;
    depthRender.depthBuffer = true;
    depthRender.depthTexture = new DepthTexture();
    depthRender.depthTexture.type = UnsignedShortType;

    const fogPass = new ShaderPass(FogShader);
    fogPass.uniforms.cameraNear.value = camera.near;
    fogPass.uniforms.cameraFar.value = camera.far;
    fogPass.uniforms.tDepth.value = depthRender.depthTexture;
    fogPass.uniforms.fogColor.value = new Vector3(1.0, 0.5, 0.0);
    fogPass.uniforms.fogCap.value = 0.6;
    fogPass.uniforms.minFogThreshhold.value = 0.0;
    fogPass.uniforms.maxFogThreshhold.value = 20.0;

    /**
     * Set up composer
     */
    let composer = new EffectComposer( renderer );
    const renderPass = new RenderPass( scene, camera );

    composer.addPass( renderPass );
    composer.addPass(fogPass);
    composer.addPass( halftonePass );


    let then = performance.now();

    /**
     * Metode som rendrer scenen til et renderTarget
     * brukes for å skaffe dybdedata til fog-effect
     */
    let render = function(renderTarget)
    {
        renderer.setRenderTarget(renderTarget);
        renderer.render(scene, camera );
    };

    /**
     * Scene render loop
     */
    function loop(now) {

        const frametime = now - then;
        then = now; //get with the times, old man!
        water.update();
        lightParticle.Step(frametime);

        player.doMove(frametime);
        render(depthRender)
        composer.render();

        requestAnimationFrame(loop);
    }

    loop(performance.now());

}

main(); // Start application
