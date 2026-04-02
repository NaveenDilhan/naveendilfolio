import './style.scss';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#experience-canvas');
const size = {
  width: window.innerWidth,
  height: window.innerHeight
};

const CAMERA_VIEWS = {
  desktop: {
    position: new THREE.Vector3(12.61, 8.83, 12.61),
    target: new THREE.Vector3(0.09, 3.59, -1.11)
  },
  mobile: {
    position: new THREE.Vector3(11.68, 14.01, 31.37),
    target: new THREE.Vector3(-0.08, 3.31, -0.74)
  }
};

// --- Animation Trackers (UPDATED) ---
const clock = new THREE.Clock();
const vgaFans = []; // Array to hold ALL fans
// Create ONE shared material for all RGB fans so it doesn't need scene lighting
const sharedRgbMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }); 

// --- Video Texture Setup ---
const video = document.createElement('video');
video.src = '/textures/video/Screen.mp4'; 
video.crossOrigin = 'Anonymous';
video.loop = true;
video.muted = true; 
video.playsInline = true;
video.play(); 

const videoTexture = new THREE.VideoTexture(video);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false; 
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

// --- Loaders Setup ---
const textureLoader = new THREE.TextureLoader(); 

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
  .setPath('/textures/skybox/')
  .load(['px.webp', 'nx.webp', 'py.webp', 'ny.webp', 'pz.webp', 'nz.webp']);

const textureMap = {
  First:  { day: "/textures/room/FirstImageTexture.webp" },
  Second: { day: "/textures/room/SecondImageTexture.webp" },
  Third:  { day: "/textures/room/ThirdImageTexture.webp" },
  Fourth: { day: "/textures/room/FourthImageTexture.webp" },
  Fifth:  { day: "/textures/room/FifthImageTexture.webp" },
  Sixth:  { day: "/textures/room/SixthImageTexture.webp" },
  Seventh:{ day: "/textures/room/SeventhImageTexture.webp" },
};

const loadedTextures = { day: {} };

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace; 
  loadedTextures.day[key] = dayTexture;
});

// --- Scene & Camera Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, size.width / size.height, 0.1, 200);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 45;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2.5;
controls.minAzimuthAngle = 0.2;
controls.maxAzimuthAngle = Math.PI / 3;

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.4; 
controls.enablePan = false; 

const setupCamera = () => {
  const isMobile = window.innerWidth < 768;
  const view = isMobile ? CAMERA_VIEWS.mobile : CAMERA_VIEWS.desktop;

  camera.position.copy(view.position);
  controls.target.copy(view.target);
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  controls.update();

  controls.maxDistance = camera.position.distanceTo(controls.target);
};

setupCamera(); 

// --- Model Loading ---
gltfLoader.load("/models/Room_Portfolio_V3.glb", (glb) => {
  glb.scene.traverse((child) => {
    
    // 1. Push EVERY fan found into our array
    if (child.name.includes("VGA_Fans")) {
      vgaFans.push(child);
    }

    if (child.isMesh) {
      // 2. Baked Textures
      const matchedKey = Object.keys(loadedTextures.day).find((key) => child.name.includes(key));
      if (matchedKey) {
        if (child.material) child.material.dispose();
        child.material = new THREE.MeshBasicMaterial({ 
          map: loadedTextures.day[matchedKey] 
        });
        if (child.material.map) {
          child.material.map.minFilter = THREE.LinearFilter;
        }
      }
      
      // 3. Glass Materials
      if (child.material && child.material.name.includes("Glass")) {
        child.material = new THREE.MeshPhysicalMaterial({
          transmission: 1,
          opacity: 1,
          metalness: 0,
          roughness: 0,
          ior: 3,
          thickness: 0.01,
          specularIntensity: 1,
          envMap: environmentMap,
          envMapIntensity: 1,
          depthWrite: false,
          specularColor: 0xfbfbfb,
        });
      }

      // 4. Computer Screen Video Texture
      if (child.name.includes("Computer_Screen")) {
        if (child.material) child.material.dispose();
        child.material = new THREE.MeshBasicMaterial({
          map: videoTexture
        });
      }

      // 5. Apply the shared RGB material to ALL fan meshes
      if (child.material && child.material.name.includes("RGB_Fan")) {
        if (child.material) child.material.dispose(); // Clean up original
        child.material = sharedRgbMaterial; // Assign our bright glowing one
      }
    }
  });
  
  scene.add(glb.scene); 
});

window.addEventListener('resize', () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
});

// --- Render Loop ---
const render = () => {
  const elapsedTime = clock.getElapsedTime();
  controls.update(); 

  // Loop through the array and rotate EVERY fan
  vgaFans.forEach(fan => {
    // Again, change .z to .x or .y if they spin on the wrong axis
    fan.rotation.z += 0.01; 
  });

  // Animate the single shared material (updates all fans instantly)
  const hue = (elapsedTime * 0.3) % 1; 
  sharedRgbMaterial.color.setHSL(hue, 1, 0.5).multiplyScalar(2.5); 
  
  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
};

render();