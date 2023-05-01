import * as THREE from 'three'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    displacementScale: -4,
    birdHeight: 24,
    birdRotation: -0.25,
    cameraHeight: 31,
}


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')


const textureLoader = new THREE.TextureLoader();
const bumpMap = textureLoader.load('/textures/maps/bumpMap.jpeg');
const map = textureLoader.load('/textures/maps/map.jpeg');


let bird = null;
const loader = new GLTFLoader();
loader.load('/models/flying_bird/scene.gltf', (gltf) => {
  bird = gltf.scene.children[0];
  bird.position.z = parameters.birdHeight;
  bird.rotation.x = Math.PI * parameters.birdRotation; 
  scene.add(bird);
});

gui.add(parameters, 'birdRotation').step(0.01);


// Scene
const scene = new THREE.Scene()

gui.add(parameters, 'birdHeight').onChange(() => {
  if(bird) bird.position.z = parameters.birdHeight;
})

const sphereGeometry = new THREE.SphereGeometry(20,64,32);
const sphereMaterial = new THREE.MeshStandardMaterial({ wireframe: false,
  flatShading: true,
  displacementMap: bumpMap,
  displacementScale: parameters.displacementScale 
});

gui.add(parameters, 'displacementScale').onChange(() => {
  sphereMaterial.displacementScale = parameters.displacementScale;
})

const sphere = new THREE.Mesh(
  sphereGeometry,
  sphereMaterial
);

sphere.receiveShadow = true;

scene.add(sphere);

const directionalLight = new THREE.DirectionalLight('lightgrey', 0.75);
directionalLight.position.z = 28;
directionalLight.lookAt(sphere);

scene.add(directionalLight);



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = parameters.cameraHeight;
scene.add(camera)

gui.add(parameters, 'cameraHeight').onChange(() => {
  camera.position.z = parameters.cameraHeight;
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Rotate the sphere
    sphere.rotation.x = elapsedTime * 0.05;
    sphere.rotation.z = elapsedTime * 0.025;

    // Move the bird 
    if(bird) { 
      bird.position.x = Math.sin(elapsedTime * 0.5) * 4; 
      bird.position.z = Math.cos(elapsedTime * 0.5) * 2 + parameters.birdHeight;
      bird.rotation.x = Math.cos(elapsedTime * 0.15) + Math.PI * parameters.birdRotation;
      bird.position > 0 ? bird.rotation.y = Math.PI * -0.15 : bird.rotation.y = Math.PI * 0.15;
    }


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
