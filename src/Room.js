import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TEXTURE_MAP } from './config.js';
import gsap from 'gsap'; 

const smokeVertexShader = `
uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

vec2 rotate2D(vec2 value, float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    mat2 m = mat2(c, s, -s, c);
    return m * value;
}

void main()
{
    vec3 newPosition = position;

    float twistPerlin = texture(
        uPerlinTexture,
        vec2(0.5, uv.y * 0.2 - uTime * 0.01)
    ).r;
    float angle = twistPerlin * 3.0;
    newPosition.xz = rotate2D(newPosition.xz, angle);

    vec2 windOffset = vec2(
        texture(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5,
        texture(uPerlinTexture, vec2(0.75, uTime * 0.01)).r - 0.5
    );
    windOffset *= pow(uv.y, 2.0) * 1.5;
    newPosition.xz += windOffset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    vUv = uv;
}
`;

const smokeFragmentShader = `
uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main()
{
    vec2 smokeUv = vUv;
    smokeUv.x *= 0.5;
    smokeUv.y *= 0.3;
    smokeUv.y -= uTime * 0.04;

    float smoke = texture(uPerlinTexture, smokeUv).r;
    smoke = smoothstep(0.4, 1.0, smoke);

    smoke *= smoothstep(0.0, 0.1, vUv.x);
    smoke *= smoothstep(1.0, 0.9, vUv.x);
    smoke *= smoothstep(0.0, 0.1, vUv.y);
    smoke *= smoothstep(1.0, 0.4, vUv.y);

    gl_FragColor = vec4(1, 1, 1, smoke);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
`;

export default class Room {
  constructor(scene, onProgress, onLoad) {
    this.scene = scene;
    this.onProgress = onProgress;
    this.onLoad = onLoad;
    
    this.vgaFans = [];
    this.raycastObjects = []; 
    this.pointerObjects = []; 
    this.interactiveObjects = []; 
    this.interactiveGroups = []; // Tracks parent groups for scaling
    this.chairTop = null; 
    
    this.sceneMaterials = []; 
    this.glassMaterials = [];
    this.swayMaterials = []; 
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
    this.initSmoke(); 
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

  initSmoke() {
    const textureLoader = new THREE.TextureLoader();
    this.perlinTexture = textureLoader.load('/shaders/perlin.png'); 
    this.perlinTexture.wrapS = THREE.RepeatWrapping;
    this.perlinTexture.wrapT = THREE.RepeatWrapping;

    const smokeGeometry = new THREE.PlaneGeometry(1, 2, 16, 64);
    smokeGeometry.translate(0, 1, 0); 

    this.smokeMaterial = new THREE.ShaderMaterial({
      vertexShader: smokeVertexShader,
      fragmentShader: smokeFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(this.perlinTexture)
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.smokeMesh = new THREE.Mesh(smokeGeometry, this.smokeMaterial);
    this.smokeMesh.scale.set(0.15, 0.4, 0.15);
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

    gltfLoader.load("/models/Room_Portfolio_V5.glb", (glb) => {
      glb.scene.traverse((child) => {
        
        if (child.name.toLowerCase().includes("cup")) {
          child.add(this.smokeMesh);
          this.smokeMesh.position.set(0, 0.1, 0); 
        }

        if (child.name.toLowerCase().includes("chair_top")) {
          this.chairTop = child;
          this.chairTop.userData.initialRotation = child.rotation.clone();
        }

        if (child.name.includes("VGA_Fans")) {
          this.vgaFans.push(child);
        }

        if (child.isMesh) {
          let interactiveGroup = null;
          let currentParent = child;
          let isInteractive = false;
          let actionTargetName = child.name.toLowerCase();

          // Search hierarchy for an interactive name
          while (currentParent) {
            const parentNameLower = currentParent.name.toLowerCase();
            if (parentNameLower.includes("raycaster") || parentNameLower.includes("pointer") || parentNameLower.includes("github") || parentNameLower.includes("linkedin") || parentNameLower.includes("instagram") || parentNameLower.includes("works") || parentNameLower.includes("about") || parentNameLower.includes("contact") || parentNameLower.includes("cat")) {
                isInteractive = true;
                actionTargetName = parentNameLower; 
                interactiveGroup = currentParent; 
                break;
            }
            currentParent = currentParent.parent;
          }

          // Apply Materials
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

          if (child.name.includes("Med_Plant") && child.material) {
            child.material = child.material.clone();
            child.material.userData.shaderUniforms = { uTime: { value: 0 } };

            child.material.onBeforeCompile = (shader) => {
              shader.uniforms.uTime = child.material.userData.shaderUniforms.uTime;
              
              shader.vertexShader = `
                uniform float uTime;
                ${shader.vertexShader}
              `;
              
              shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                
                float heightFactor = max(0.0, position.y - 0.1); 
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

          // Apply interactive properties and DoubleSide
          if (isInteractive) {
            if (!interactiveGroup.userData.originalScale) {
                interactiveGroup.userData.originalScale = interactiveGroup.scale.clone();
                interactiveGroup.userData.targetScale = interactiveGroup.scale.clone();
                this.interactiveGroups.push(interactiveGroup);
            }
            child.userData.interactiveGroup = interactiveGroup;
            child.userData.actionName = actionTargetName;
            
            if (child.material) {
                child.material.side = THREE.DoubleSide; 
            }

            this.raycastObjects.push(child);
            this.pointerObjects.push(child);
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

    if (this.smokeMaterial) {
       gsap.to(this.smokeMaterial, {
         opacity: isNight ? 0.4 : 1.0,
         duration: duration,
         ease: 'power2.inOut'
       });
    }
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

    // Scale the Parent Groups
    if (this.interactiveGroups) {
      this.interactiveGroups.forEach(group => {
        if (group.userData.targetScale) group.scale.lerp(group.userData.targetScale, 0.15); 
      });
    }

    this.swayMaterials.forEach(mat => {
      if (mat.userData.shaderUniforms) {
        mat.userData.shaderUniforms.uTime.value = elapsedTime;
      }
    });

    if (this.smokeMaterial && this.smokeMaterial.uniforms) {
       this.smokeMaterial.uniforms.uTime.value = elapsedTime;
    }

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