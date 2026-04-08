// src/App.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import Stats from 'stats.js'; 
import { CAMERA_VIEWS } from './config.js';
import Room from './Room.js';
import AudioManager from './AudioManager.js'; 

export default class App {
  constructor(canvasId) {
    this.canvas = document.querySelector(canvasId);
    this.size = { width: window.innerWidth, height: window.innerHeight };
    this.clock = new THREE.Clock();
    
    this.frameCount = 0; 
    this.slowFrameCount = 0; 
    
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    this.highestProgress = 0; 
    this.wasCatHovered = false;
    this.isIntroDone = false; 

    this.render = this.render.bind(this);

    this.initStats(); 
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initModals();     
    this.initRaycaster(); 
    this.initThemeToggle(); 
    
    this.audioManager = new AudioManager(); 
    
    this.room = new Room(
        this.scene, 
        this.renderer, 
        this.handleLoadProgress.bind(this), 
        this.handleLoadComplete.bind(this)
    );

    this.addEventListeners();
    
    gsap.ticker.add(this.render);
  }

  initStats() {
    this.stats = new Stats();
    this.stats.showPanel(0); 
    
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.top = '0px';
    this.stats.dom.style.left = '0px';
    this.stats.dom.style.zIndex = '9999';
    
    document.body.appendChild(this.stats.dom);
  }

  initThemeToggle() {
    // OPTIMIZATION: Completely remove night mode button on mobile
    if (this.isMobile) return;

    const btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.innerHTML = '🌙';
    document.body.appendChild(btn);

    this.isNightMode = false;

    btn.addEventListener('click', () => {
      this.isNightMode = !this.isNightMode;
      
      btn.innerHTML = this.isNightMode ? '☀️' : '🌙';
      btn.classList.toggle('night-active', this.isNightMode);
      
      if (this.room) {
        this.room.toggleNightMode(this.isNightMode);
      }
      
      if (this.audioManager) {
        if (this.isNightMode) {
          this.audioManager.playRain();
        } else {
          this.audioManager.stopRain();
        }
      }
    });
  }

  handleLoadProgress(progress) {
    const percent = Math.round(progress * 100);
    
    if (percent > this.highestProgress) {
      this.highestProgress = percent;
      document.getElementById('progress-text').innerText = `${this.highestProgress}%`;
      gsap.to('#progress-bar', { width: `${this.highestProgress}%`, duration: 0.3, ease: 'power1.out' });
    }
  }

  handleLoadComplete() {
    const finalCameraPos = this.camera.position.clone();

    this.camera.position.set(
      finalCameraPos.x * 0.2, 
      finalCameraPos.y * 0.3 + 1, 
      finalCameraPos.z * 0.2
    );
    this.camera.lookAt(this.controls.target);
    this.camera.updateProjectionMatrix();

    if (this.controls) this.controls.enabled = false;

    this.renderer.compile(this.scene, this.camera);
    this.renderer.render(this.scene, this.camera); 
    this.renderer.render(this.scene, this.camera); 

    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');

    if (progressText) {
      progressText.innerText = "Click to Start";
      progressText.classList.add('start-btn'); 
    }

    if (progressBar && progressBar.parentElement) {
       progressBar.parentElement.style.display = 'none';
    }

    const startExperience = () => {
      if (progressText) progressText.removeEventListener('click', startExperience);
      
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
          loadingScreen.style.backdropFilter = 'none';
          loadingScreen.style.webkitBackdropFilter = 'none';
      }

      gsap.to('.loader-content', { opacity: 0, scale: 0.9, duration: 0.2, ease: 'power2.in' });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            this.audioManager.playInitialRandom(); 
            this.clock.start();

            const tl = gsap.timeline({
              onComplete: () => {
                if (this.controls) this.controls.enabled = true;
                this.isIntroDone = true; 
                if (!this.isMobile) {
                    gsap.to('#theme-toggle-btn', { opacity: 1, scale: 1, duration: 0.5, pointerEvents: 'auto' });
                }
                if(this.room) this.room.startVideoPlayback(); 
              }
            });
            
            tl.to('#loading-screen', { opacity: 0, duration: 0.8, ease: 'power2.inOut', onComplete: () => {
                 loadingScreen.style.display = 'none'; 
              }})
              .to(this.camera.position, { 
                x: finalCameraPos.x, 
                y: finalCameraPos.y, 
                z: finalCameraPos.z,
                duration: 3.5, 
                ease: 'power3.inOut',
                onUpdate: () => {
                   this.camera.lookAt(this.controls.target);
                }
              }, "-=0.6");
          }, 50);
        });
      });
    };

    if (progressText) {
      progressText.addEventListener('click', startExperience);
    } else {
      window.addEventListener('click', startExperience); 
    }
  }

  initScene() {
    this.scene = new THREE.Scene();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(35, this.size.width / this.size.height, 0.1, 200);
    
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.minDistance = 5;
    this.controls.minPolarAngle = 0;
    this.controls.minAzimuthAngle = 0.2;
    this.controls.maxAzimuthAngle = Math.PI / 2.5;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.4; 
    this.controls.enablePan = false; 

    this.setupCameraView();
  }

  setupCameraView() {
    const view = this.isMobile ? CAMERA_VIEWS.mobile : CAMERA_VIEWS.desktop;

    this.camera.position.copy(view.position);
    this.controls.target.copy(view.target);
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    this.controls.maxPolarAngle = this.isMobile ? Math.PI / 3.0 : Math.PI / 2.5;
    this.controls.update();
    this.controls.maxDistance = this.camera.position.distanceTo(this.controls.target);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
        canvas: this.canvas, 
        antialias: !this.isMobile, 
        powerPreference: "high-performance",
        alpha: false,
        stencil: false
    });
    this.renderer.setSize(this.size.width, this.size.height);
    
    // OPTIMIZATION: Start mobile at pixel ratio 1.0 to guarantee smooth frames
    this.targetPixelRatio = this.isMobile ? 1.0 : Math.min(window.devicePixelRatio, 2);
    this.currentPixelRatio = this.targetPixelRatio;
    
    this.renderer.setPixelRatio(this.currentPixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  initModals() {
    this.modalContainer = document.getElementById('modal-container');
    this.modalOverlay = document.querySelector('.modal-overlay');
    this.modals = {
      works: document.getElementById('modal-works'),
      about: document.getElementById('modal-about'),
      contact: document.getElementById('modal-contact')
    };

    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });
    this.modalOverlay.addEventListener('click', () => this.closeModal());

    this.currentWorkIndex = 0;
    this.workItems = document.querySelectorAll('.work-item');
    this.workCounter = document.getElementById('work-counter');
    const prevBtn = document.getElementById('prev-work');
    const nextBtn = document.getElementById('next-work');

    if (this.workItems.length > 0 && prevBtn && nextBtn && this.workCounter) {
      const updateWorksUI = () => {
        this.workItems.forEach((item, index) => {
          if (index === this.currentWorkIndex) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
        
        this.workCounter.innerText = `${this.currentWorkIndex + 1} / ${this.workItems.length}`;
        
        prevBtn.disabled = this.currentWorkIndex === 0;
        nextBtn.disabled = this.currentWorkIndex === this.workItems.length - 1;
      };

      prevBtn.addEventListener('click', () => {
        if (this.currentWorkIndex > 0) {
          this.currentWorkIndex--;
          updateWorksUI();
        }
      });

      nextBtn.addEventListener('click', () => {
        if (this.currentWorkIndex < this.workItems.length - 1) {
          this.currentWorkIndex++;
          updateWorksUI();
        }
      });

      updateWorksUI();
    }
  }

  openModal(type) {
    if (this.controls) this.controls.enabled = false; 

    document.body.classList.add('modal-open');

    Object.values(this.modals).forEach(m => m.classList.remove('active'));
    
    const activeModal = this.modals[type];
    if (!activeModal) return;
    
    activeModal.classList.add('active');
    this.modalContainer.classList.add('active');

    gsap.timeline()
      .to(this.modalContainer, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      .fromTo(activeModal, 
        { y: 60, scale: 0.95, opacity: 0 }, 
        { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' }, 
        "-=0.15"
      );
  }

  closeModal() {
    if (this.controls) this.controls.enabled = true; 

    document.body.classList.remove('modal-open');

    const activeModal = document.querySelector('.modal-content.active');

    gsap.timeline({
      onComplete: () => {
        this.modalContainer.classList.remove('active');
        if (activeModal) activeModal.classList.remove('active');
      }
    })
    .to(activeModal, { y: 30, scale: 0.98, opacity: 0, duration: 0.2, ease: 'power2.in' })
    .to(this.modalContainer, { opacity: 0, duration: 0.3, ease: 'power2.in' }, "-=0.1");
  }

  initRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-2, -2); 
    this.lastRaycastMouse = new THREE.Vector2(-2, -2); 
    this.pointerDownPosition = new THREE.Vector2();
    this.currentIntersects = []; 

    window.addEventListener('pointermove', (event) => {
      if (this.isMobile) return; // Prevent unnecessary variable updates on mobile swipe
      this.mouse.x = (event.clientX / this.size.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.size.height) * 2 + 1;
    });

    window.addEventListener('pointerdown', (event) => {
      this.pointerDownPosition.set(event.clientX, event.clientY);
    });

    window.addEventListener('pointerup', (event) => {
      const distance = Math.hypot(event.clientX - this.pointerDownPosition.x, event.clientY - this.pointerDownPosition.y);
      
      if (distance > 5) return; 

      if (!this.room || this.modalContainer.classList.contains('active') || !this.isIntroDone) return;

      const interactiveObjects = this.room.interactiveObjects;
      if (interactiveObjects.length === 0) return;

      this.mouse.x = (event.clientX / this.size.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.size.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(interactiveObjects, false);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const actionNameLower = clickedObject.userData.actionName || clickedObject.name.toLowerCase();

        if (actionNameLower.includes('speaker')) {
           this.audioManager.togglePlayerUI();
        }

        if (actionNameLower.includes('github')) {
          window.open('https://github.com/naveendilhan', '_blank');
        } else if (actionNameLower.includes('linkedin')) {
          window.open('https://www.linkedin.com/in/naveen-wickramasinghe/', '_blank');
        } else if (actionNameLower.includes('instagram')) {
          window.open('https://www.instagram.com/nauuveeyn/', '_blank');
        } 
        
        if (actionNameLower.includes('works')) this.openModal('works');
        else if (actionNameLower.includes('about')) this.openModal('about');
        else if (actionNameLower.includes('contact')) this.openModal('contact');
      }

      // Reset touch coordinates to avoid ghost clicks/hovers
      if (this.isMobile) {
        setTimeout(() => { this.mouse.set(-2, -2); }, 100);
      }
    });

    window.addEventListener('pointercancel', () => {
      if (this.isMobile) this.mouse.set(-2, -2);
    });
  }

  addEventListeners() {
    window.addEventListener('resize', () => {
      this.size.width = window.innerWidth;
      this.size.height = window.innerHeight;
      
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < 768; 

      if (wasMobile !== this.isMobile) {
          this.setupCameraView(); 
      }

      this.renderer.setSize(this.size.width, this.size.height);
      
      this.targetPixelRatio = this.isMobile ? 1.0 : Math.min(window.devicePixelRatio, 2);
      this.currentPixelRatio = this.targetPixelRatio;
      this.renderer.setPixelRatio(this.currentPixelRatio);

      this.camera.aspect = this.size.width / this.size.height;
      this.camera.updateProjectionMatrix();
    });
  }

  render() {
    if (this.stats) this.stats.begin();

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.elapsedTime;
    
    this.frameCount++;

    if (delta > 0.025 && !this.isMobile) { 
      this.slowFrameCount++;
      if (this.slowFrameCount > 30 && this.currentPixelRatio > 1.0) {
        this.currentPixelRatio = Math.max(1.0, this.currentPixelRatio - 0.25);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.currentPixelRatio));
        this.slowFrameCount = 0; 
      }
    } else {
      this.slowFrameCount = 0;
    }

    if (this.controls && this.controls.enabled) {
        this.controls.update(); 
    }

    if (this.room && this.room.interactiveObjects) {
      if (this.room.interactiveGroups) {
        this.room.interactiveGroups.forEach(group => {
          if (group.userData.originalScale) {
             group.userData.targetScale.copy(group.userData.originalScale);
          }
        });
      }

      if (this.isIntroDone && this.room.interactiveObjects.length > 0) {
        
        // OPTIMIZATION: Entirely skip continuous hover raycasting on mobile devices
        if (!this.isMobile) {
            const mouseMoved = this.mouse.x !== this.lastRaycastMouse.x || this.mouse.y !== this.lastRaycastMouse.y;

            if (this.frameCount % 3 === 0) {
                if (mouseMoved && this.mouse.x >= -1 && this.mouse.x <= 1 && this.mouse.y >= -1 && this.mouse.y <= 1) {
                    this.raycaster.setFromCamera(this.mouse, this.camera);
                    this.currentIntersects = this.raycaster.intersectObjects(this.room.interactiveObjects, false);
                    this.lastRaycastMouse.copy(this.mouse); 
                } else if (!mouseMoved) {
                    // Do nothing, reuse previous
                } else {
                    this.currentIntersects = [];
                }
            }
            
            const intersects = this.currentIntersects || [];
            
            let shouldShowPointer = false;
            let isCatHoveredThisFrame = false; 

            if (intersects.length > 0 && !this.modalContainer.classList.contains('active')) {
              const hoveredObject = intersects[0].object;
              const interactiveGroup = hoveredObject.userData.interactiveGroup; 
              
              const actionNameLower = hoveredObject.userData.actionName || hoveredObject.name.toLowerCase();

              const isPointerObject = actionNameLower.includes('pointer') || 
                                      actionNameLower.includes('github') || 
                                      actionNameLower.includes('linkedin') || 
                                      actionNameLower.includes('instagram') ||
                                      actionNameLower.includes('works') ||
                                      actionNameLower.includes('about') ||
                                      actionNameLower.includes('contact') ||
                                      actionNameLower.includes('speaker') ||
                                      actionNameLower.includes('cat'); 

              if (isPointerObject) shouldShowPointer = true;
              if (actionNameLower.includes('cat')) isCatHoveredThisFrame = true;

              const isRaycastObject = actionNameLower.includes('raycaster') || isPointerObject;

              if (isRaycastObject && interactiveGroup && interactiveGroup.userData.originalScale) {
                interactiveGroup.userData.targetScale.copy(interactiveGroup.userData.originalScale).multiplyScalar(1.2);
              }
            }
            
            document.body.style.cursor = shouldShowPointer ? 'pointer' : 'default';

            if (isCatHoveredThisFrame && !this.wasCatHovered) {
              this.audioManager.playMeow();
            }
            this.wasCatHovered = isCatHoveredThisFrame;
        }
      }
    }

    this.room.update(elapsedTime);
    this.renderer.render(this.scene, this.camera);

    if (this.stats) this.stats.end();
  }
}