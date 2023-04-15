import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Textures
const textureLoader = new THREE.TextureLoader();

const LogoColor = textureLoader.load("/textures/Logo/LogoColor.png");
const LogoWhite = textureLoader.load("/textures/Logo/LogoWhite.png");

// flip the logo
LogoColor.flipY = false;
LogoWhite.flipY = false;

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const loader = new RGBELoader();
const hdrTextureURL = new URL("sky.hdr", import.meta.url);
loader.load(hdrTextureURL, (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  // scene.environment = texture;
});
/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff, 0.5);
light.position.x = 2;
light.position.y = 3;
light.position.z = 4;
scene.add(light);

const light2 = new THREE.PointLight(0xffffff, 2);
light2.position.z = 2;
scene.add(light2);

/**
 * Objects
 */

let LogoTexture = {
  texture: LogoColor,
};

const gltfLoader = new GLTFLoader();

let TshirtColor = { color: "#110d0d" };
let TshirtMat = new THREE.MeshStandardMaterial();

gltfLoader.load("Tshirt.glb", (gltf) => {
  scene.add(gltf.scene);

  // traverse each object in the scene
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial();
      child.material.color = new THREE.Color(TshirtColor.color);
      TshirtMat = child.material;
      // child.material.roughness = 0.9;
      child.material.side = THREE.DoubleSide;
      //   child.material.metalness = 0.8;
    }
  });
});

let PlaneMat = new THREE.MeshStandardMaterial();
gltfLoader.load("Plane.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.material.map = LogoTexture.texture;
      child.material.transparent = true;
      // child.material.opacity = 1;
      // child.material.side = THREE.DoubleSide;
      PlaneMat = child.material;
    }
  });
});

const planeMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  })
);

planeMesh.position.z = -2;
scene.add(planeMesh);

gui.addColor(TshirtColor, "color").onChange(() => {
  //   console.log(TshirtColor);
});

// Create a GUI to switch logo texture from LogoColor to LogoWhite
gui.add(LogoTexture, "texture", [LogoColor, LogoWhite]).onChange(() => {
  LogoTexture.texture = LogoTexture.texture;
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 0.7;
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.target.z = -1;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  // controls.update();

  TshirtMat.color = new THREE.Color(TshirtColor.color);
  PlaneMat.map = LogoTexture.texture;
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
