import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TEXTURE_MAP } from './config.js';

export default class Room {
  constructor(scene) {
    this.scene = scene;
    this.vgaFans = [];
    this.sharedRgbMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    this.loadedTextures = { day: {} };
    
    this.initVideo();
    this.initTextures();
    this.initModel();
  }

  initVideo() {
    this.video = document.createElement('video');
    this.video.src = '/textures/video/Screen.mp4'; 
    this.video.crossOrigin = 'Anonymous';
    this.video.loop = true;
    this.video.muted = true; 
    this.video.playsInline = true;
    this.video.play(); 

    this.videoTexture = new THREE.VideoTexture(this.video);
    this.videoTexture.colorSpace = THREE.SRGBColorSpace;
    this.videoTexture.flipY = false; 
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
  }

  initTextures() {
    const textureLoader = new THREE.TextureLoader(); 
    
    Object.entries(TEXTURE_MAP).forEach(([key, paths]) => {
      const dayTexture = textureLoader.load(paths.day);
      dayTexture.flipY = false;
      dayTexture.colorSpace = THREE.SRGBColorSpace; 
      this.loadedTextures.day[key] = dayTexture;
    });

    this.environmentMap = new THREE.CubeTextureLoader()
      .setPath('/textures/skybox/')
      .load(['px.webp', 'nx.webp', 'py.webp', 'ny.webp', 'pz.webp', 'nz.webp']);
  }

  initModel() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load("/models/Room_Portfolio_V3.glb", (glb) => {
      glb.scene.traverse((child) => {
        
        // 1. Collect VGA Fans
        if (child.name.includes("VGA_Fans")) {
          this.vgaFans.push(child);
        }

        if (child.isMesh) {
          // 2. Baked Textures
          const matchedKey = Object.keys(this.loadedTextures.day).find((key) => child.name.includes(key));
          if (matchedKey) {
            if (child.material) child.material.dispose();
            child.material = new THREE.MeshBasicMaterial({ 
              map: this.loadedTextures.day[matchedKey] 
            });
            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }
          }
          
          // 3. Glass Materials
          if (child.material && child.material.name.includes("Glass")) {
            child.material = new THREE.MeshPhysicalMaterial({
              transmission: 1, opacity: 1, metalness: 0, roughness: 0,
              ior: 3, thickness: 0.01, specularIntensity: 1,
              envMap: this.environmentMap, envMapIntensity: 1,
              depthWrite: false, specularColor: 0xfbfbfb,
            });
          }

          // 4. Computer Screen Video Texture
          if (child.name.includes("Computer_Screen")) {
            if (child.material) child.material.dispose();
            child.material = new THREE.MeshBasicMaterial({ map: this.videoTexture });
          }

          // 5. RGB Fans shared material
          if (child.material && child.material.name.includes("RGB_Fan")) {
            if (child.material) child.material.dispose(); 
            child.material = this.sharedRgbMaterial; 
          }
        }
      });
      
      this.scene.add(glb.scene); 
    });
  }

  update(elapsedTime) {
    // Animate fans
    this.vgaFans.forEach(fan => {
      fan.rotation.z += 0.01; 
    });

    // Animate RGB material
    const hue = (elapsedTime * 0.3) % 1; 
    this.sharedRgbMaterial.color.setHSL(hue, 1, 0.5).multiplyScalar(2.5); 
  }
}