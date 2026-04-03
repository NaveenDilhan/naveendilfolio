// src/App.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { CAMERA_VIEWS } from './config.js';
import Room from './Room.js';
import AudioManager from './AudioManager.js'; 

export default class App {
  constructor(canvasId) {
    this.canvas = document.querySelector(canvasId);
    this.size = { width: window.innerWidth, height: window.innerHeight };
    this.clock = new THREE.Clock();
    
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    this.highestProgress = 0; 

    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initModals();     
    this.initRaycaster(); 
    
    // Initialize Audio Manager
    this.audioManager = new AudioManager(); 
    
    this.room = new Room(
        this.scene, 
        this.handleLoadProgress.bind(this), 
        this.handleLoadComplete.bind(this)
    );

    this.addEventListeners();
    this.render();
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

    if (this.controls) this.controls.enabled = false;

    // --- Transform progress text into a "Click to Start" Button ---
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');

    if (progressText) {
      progressText.innerText = "Click to Start";
      progressText.classList.add('start-btn'); 
    }

    // Hide the progress bar so only the button is visible
    if (progressBar && progressBar.parentElement) {
       progressBar.parentElement.style.display = 'none';
    }

    const startExperience = () => {
      window.removeEventListener('pointerdown', startExperience);
      
      // Since the user has now clicked, the browser will allow audio to play!
      this.audioManager.playInitialRandom(); 

      const tl = gsap.timeline({
        onComplete: () => {
          if (this.controls) this.controls.enabled = true;
        }
      });
      
      tl.to('.loader-content', { opacity: 0, scale: 0.9, duration: 0.5, ease: 'power2.in' }) 
        .to('#loading-screen', { opacity: 0, duration: 0.8, ease: 'power2.inOut', onComplete: () => {
           document.getElementById('loading-screen').style.display = 'none'; 
        }})
        .to(this.camera.position, { 
          x: finalCameraPos.x, 
          y: finalCameraPos.y, 
          z: finalCameraPos.z,
          duration: 3.5, 
          ease: 'power3.inOut' 
        }, "-=0.6"); 
    };

    // Wait for user interaction before fading the loading screen out
    window.addEventListener('pointerdown', startExperience);
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
    
    const pixelRatioTarget = this.isMobile ? 1.5 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioTarget));
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
  }

  openModal(type) {
    if (this.controls) this.controls.enabled = false; 

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
    this.pointerDownPosition = new THREE.Vector2();

    window.addEventListener('pointermove', (event) => {
      this.mouse.x = (event.clientX / this.size.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.size.height) * 2 + 1;
    });

    window.addEventListener('pointerdown', (event) => {
      this.pointerDownPosition.set(event.clientX, event.clientY);
    });

    window.addEventListener('pointerup', (event) => {
      const distance = Math.hypot(event.clientX - this.pointerDownPosition.x, event.clientY - this.pointerDownPosition.y);
      if (distance > 5) return; 

      if (!this.room || this.modalContainer.classList.contains('active')) return;

      const interactiveObjects = this.room.interactiveObjects;
      if (interactiveObjects.length === 0) return;

      this.mouse.x = (event.clientX / this.size.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.size.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(interactiveObjects, false);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const nameLower = clickedObject.name.toLowerCase();

        if (nameLower.includes('speaker')) {
           this.audioManager.togglePlayerUI();
        }

        if (nameLower.includes('github')) {
          window.open('https://github.com/naveendilhan', '_blank');
        } else if (nameLower.includes('linkedin')) {
          window.open('https://linkedin.com/in/your-profile', '_blank');
        } else if (nameLower.includes('instagram')) {
          window.open('https://instagram.com/your-profile', '_blank');
        } 
        
        if (nameLower.includes('works')) this.openModal('works');
        else if (nameLower.includes('about')) this.openModal('about');
        else if (nameLower.includes('contact')) this.openModal('contact');
      }
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
      const pixelRatioTarget = this.isMobile ? 1.5 : 2;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioTarget));

      this.camera.aspect = this.size.width / this.size.height;
      this.camera.updateProjectionMatrix();
    });
  }

  render() {
    const elapsedTime = this.clock.getElapsedTime();
    this.controls.update(); 

    if (this.room && this.room.interactiveObjects) {
      const interactiveObjects = this.room.interactiveObjects;
      
      if (interactiveObjects.length > 0) {
        interactiveObjects.forEach(obj => {
          if (obj.userData.originalScale) {
            obj.userData.targetScale.copy(obj.userData.originalScale);
          }
        });

        if (!this.isMobile) {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(interactiveObjects, false);
            
            let shouldShowPointer = false;

            if (intersects.length > 0 && !this.modalContainer.classList.contains('active')) {
              const hoveredObject = intersects[0].object;
              const nameLower = hoveredObject.name.toLowerCase();

              const isPointerObject = nameLower.includes('pointer') || 
                                      nameLower.includes('github') || 
                                      nameLower.includes('linkedin') || 
                                      nameLower.includes('instagram') ||
                                      nameLower.includes('works') ||
                                      nameLower.includes('about') ||
                                      nameLower.includes('contact') ||
                                      nameLower.includes('speaker'); 

              if (isPointerObject) shouldShowPointer = true;

              const isRaycastObject = nameLower.includes('raycaster') || isPointerObject;

              if (isRaycastObject && hoveredObject.userData.originalScale) {
                hoveredObject.userData.targetScale.copy(hoveredObject.userData.originalScale).multiplyScalar(1.2);
              }
            }
            document.body.style.cursor = shouldShowPointer ? 'pointer' : 'default';
        }
      }
    }

    this.room.update(elapsedTime);
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}