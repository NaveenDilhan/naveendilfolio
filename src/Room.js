import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TEXTURE_MAP } from './config.js';
import gsap from 'gsap'; 

export default class Room {
  constructor(scene, onProgress, onLoad) {
    this.scene = scene;
    this.onProgress = onProgress;
    this.onLoad = onLoad;
    
    this.vgaFans = [];
    this.raycastObjects = []; 
    this.pointerObjects = []; 
    this.interactiveObjects = []; 
    this.chairTop = null; 
    
    this.sceneMaterials = []; 
    this.glassMaterials = [];
    this.swayMaterials = []; // --- NEW: Track materials that need wind animation ---
    this.isNight = false;
    
    this.sharedRgbMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    this.loadedTextures = { day: {} };
    
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = itemsLoaded / itemsTotal;
      if (this.onProgress) this.onProgress(progress);
    };

    THREE.DefaultLoadingManager.onLoad = () => {
      if (this.onLoad) this.onLoad();
    };

    THREE.DefaultLoadingManager.onError = (url) => {
      console.error('⚠️ Missing File Detected. Could not load:', url);
      if (this.onLoad) this.onLoad(); 
    };

    this.initVideo();
    this.initTextures();
    this.initRain(); 
    this.initModel();
  }

  initRain() {
    const rainCount = 2000;
    this.rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    this.rainVelocities = [];

    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 25; 
      rainPositions[i * 3 + 1] = Math.random() * 20;     
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 25; 
      this.rainVelocities.push(0.15 + Math.random() * 0.1);  
    }

    this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    this.rainMaterial = new THREE.PointsMaterial({
      color: 0xaaccff,
      size: 0.06,
      transparent: true,
      opacity: 0, 
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.rainSystem = new THREE.Points(this.rainGeometry, this.rainMaterial);
    this.scene.add(this.rainSystem);
  }

  initVideo() {
    this.video = document.createElement('video');
    this.video.src = '/textures/video/Screen.mp4'; 
    this.video.crossOrigin = 'Anonymous';
    this.video.loop = true;
    this.video.muted = true; 
    this.video.playsInline = true;
    
    this.video.play().catch(e => console.warn("Video autoplay prevented:", e)); 

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

    gltfLoader.load("/models/Room_Portfolio_V4.glb", (glb) => {
      glb.scene.traverse((child) => {
        
        if (child.name.toLowerCase().includes("chair_top")) {
          this.chairTop = child;
          this.chairTop.userData.initialRotation = child.rotation.clone();
        }

        if (child.name.includes("VGA_Fans")) {
          this.vgaFans.push(child);
        }

        if (child.isMesh) {
          const nameLower = child.name.toLowerCase();

          const isInteractive = nameLower.includes("raycaster") || 
                                nameLower.includes("pointer") || 
                                nameLower.includes("github") || 
                                nameLower.includes("linkedin") || 
                                nameLower.includes("instagram") ||
                                nameLower.includes("works") ||
                                nameLower.includes("about") ||
                                nameLower.includes("contact") ||
                                nameLower.includes("cat");

          if (isInteractive) {
            child.userData.originalScale = child.scale.clone();
            child.userData.targetScale = child.scale.clone();
            
            this.raycastObjects.push(child);
            this.pointerObjects.push(child);
          }

          const matchedKey = Object.keys(this.loadedTextures.day).find((key) => child.name.includes(key));
          if (matchedKey) {
            if (child.material) child.material.dispose();
            child.material = new THREE.MeshBasicMaterial({ 
              map: this.loadedTextures.day[matchedKey],
              color: 0xffffff 
            });
            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }
          }
          
          if (child.material && child.material.name.includes("Glass")) {
            if (this.isMobile) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xfbfbfb, transparent: true, opacity: 0.25,
                roughness: 0.1, metalness: 0.8,
                envMap: this.environmentMap, envMapIntensity: 1.5,
                depthWrite: false
              });
            } else {
              child.material = new THREE.MeshPhysicalMaterial({
                transmission: 1, opacity: 1, metalness: 0, roughness: 0,
                ior: 3, thickness: 0.01, specularIntensity: 1,
                envMap: this.environmentMap, envMapIntensity: 1,
                depthWrite: false, specularColor: 0xfbfbfb,
              });
            }
          }

          if (child.name.includes("Computer_Screen")) {
            if (child.material) child.material.dispose();
            child.material = new THREE.MeshBasicMaterial({ map: this.videoTexture });
          }

          if (child.material && child.material.name.includes("RGB_Fan")) {
            if (child.material) child.material.dispose(); 
            child.material = this.sharedRgbMaterial; 
          }

          // --- NEW: Med_Plant Vertex Shader Animation ---
          if (child.name.includes("Med_Plant") && child.material) {
            // Clone material so we don't accidentally warp other objects sharing the texture
            child.material = child.material.clone();
            
            // Set up uniform for time
            child.material.userData.shaderUniforms = { uTime: { value: 0 } };

            child.material.onBeforeCompile = (shader) => {
              shader.uniforms.uTime = child.material.userData.shaderUniforms.uTime;
              
              // Inject time variable
              shader.vertexShader = `
                uniform float uTime;
                ${shader.vertexShader}
              `;
              
              // Inject displacement logic
              shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                
                // Calculate how high the vertex is. 
                // The max() ensures values below the threshold stay 0 (pot won't move).
                // If the pot is swaying slightly, increase '0.1' to '0.3' or higher.
                float heightFactor = max(0.0, position.y - 0.1); 
                
                // Sine wave for smooth wind oscillation 
                float windX = sin(uTime * 1.5 + position.x) * 0.03 * heightFactor;
                float windZ = cos(uTime * 1.2 + position.z) * 0.03 * heightFactor;
                
                transformed.x += windX;
                transformed.z += windZ;
                `
              );
            };
            
            this.swayMaterials.push(child.material);
          }

          if (child.material) {
             if (!child.name.includes("Computer_Screen") && !child.material.name.includes("RGB_Fan") && !child.material.name.includes("Glass")) {
                this.sceneMaterials.push(child.material);
             } else if (child.material.name.includes("Glass")) {
                this.glassMaterials.push(child.material);
             }
          }
        }
      });
      
      this.scene.add(glb.scene); 
      this.interactiveObjects = [...new Set([...this.raycastObjects, ...this.pointerObjects])];
    });
  }

  toggleNightMode(isNight) {
    this.isNight = isNight;
    
    const targetColor = isNight ? new THREE.Color(0x2b3044) : new THREE.Color(0xffffff);
    const duration = 2; 

    this.sceneMaterials.forEach(mat => {
      if (mat.color) {
        gsap.to(mat.color, {
          r: targetColor.r, g: targetColor.g, b: targetColor.b,
          duration: duration,
          ease: 'power2.inOut'
        });
      }
    });

    this.glassMaterials.forEach(mat => {
      gsap.to(mat, {
        envMapIntensity: isNight ? 0.1 : (this.isMobile ? 1.5 : 1),
        duration: duration,
        ease: 'power2.inOut'
      });
    });

    gsap.to(this.rainMaterial, {
      opacity: isNight ? 0.6 : 0,
      duration: duration,
      ease: 'power2.inOut'
    });
  }

  update(elapsedTime) {
    this.vgaFans.forEach(fan => {
      fan.rotation.z += 0.01; 
    });

    if (this.chairTop && this.chairTop.userData.initialRotation) {
      const rockSpeed = 1.2; 
      const rockAmplitude = 0.3; 
      this.chairTop.rotation.y = this.chairTop.userData.initialRotation.y + (Math.sin(elapsedTime * rockSpeed) * rockAmplitude);
    }

    const hue = (elapsedTime * 0.3) % 1; 
    this.sharedRgbMaterial.color.setHSL(hue, 1, 0.5).multiplyScalar(2.5); 

    this.interactiveObjects.forEach(obj => {
      if (obj.userData.targetScale) {
        obj.scale.lerp(obj.userData.targetScale, 0.15); 
      }
    });

    // --- NEW: Update Time for Plant Shader ---
    this.swayMaterials.forEach(mat => {
      if (mat.userData.shaderUniforms) {
        mat.userData.shaderUniforms.uTime.value = elapsedTime;
      }
    });

    if (this.isNight || this.rainMaterial.opacity > 0) {
      const positions = this.rainGeometry.attributes.position.array;
      for (let i = 0; i < this.rainVelocities.length; i++) {
        positions[i * 3 + 1] -= this.rainVelocities[i]; 
        positions[i * 3] -= 0.02; 

        if (positions[i * 3 + 1] < -2) { 
          positions[i * 3 + 1] = 10 + Math.random() * 5;
          positions[i * 3] = (Math.random() - 0.5) * 25; 
        }
      }
      this.rainGeometry.attributes.position.needsUpdate = true;
    }
  }
}