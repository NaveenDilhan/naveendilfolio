import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { CAMERA_VIEWS } from './config.js';
import Room from './Room.js';

export default class App {
  constructor(canvasId) {
    this.canvas = document.querySelector(canvasId);
    this.size = { width: window.innerWidth, height: window.innerHeight };
    this.clock = new THREE.Clock();

    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initModals();     // Initialize Modals and UI logic
    this.initRaycaster(); 
    
    // Initialize the Room Model
    this.room = new Room(this.scene);

    this.addEventListeners();
    
    // Start Render Loop
    this.render();
  }

  initScene() {
    this.scene = new THREE.Scene();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(35, this.size.width / this.size.height, 0.1, 200);
    
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.minDistance = 5;
    this.controls.maxDistance = 45;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI / 2.5;
    this.controls.minAzimuthAngle = 0.2;
    this.controls.maxAzimuthAngle = Math.PI / 3;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.4; 
    this.controls.enablePan = false; 

    this.setupCameraView();
  }

  setupCameraView() {
    const isMobile = window.innerWidth < 768;
    const view = isMobile ? CAMERA_VIEWS.mobile : CAMERA_VIEWS.desktop;

    this.camera.position.copy(view.position);
    this.controls.target.copy(view.target);
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.controls.update();

    this.controls.maxDistance = this.camera.position.distanceTo(this.controls.target);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

    // Close button logic
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    // Click outside to close
    this.modalOverlay.addEventListener('click', () => this.closeModal());
  }

  openModal(type) {
    if (this.controls) this.controls.enabled = false; // Stop room rotation

    // Reset modals
    Object.values(this.modals).forEach(m => m.classList.remove('active'));
    
    const activeModal = this.modals[type];
    if (!activeModal) return;
    
    activeModal.classList.add('active');
    this.modalContainer.classList.add('active');

    // Smooth Entrance with GSAP
    gsap.timeline()
      .to(this.modalContainer, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      .fromTo(activeModal, 
        { y: 60, scale: 0.95, opacity: 0 }, 
        { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' }, 
        "-=0.15"
      );
  }

  closeModal() {
    if (this.controls) this.controls.enabled = true; // Re-enable rotation

    const activeModal = document.querySelector('.modal-content.active');

    // Smooth Exit with GSAP
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

    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / this.size.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.size.height) * 2 + 1;
    });

    window.addEventListener('click', () => {
      if (!this.room) return;
      
      // Prevent raycasting if modal is currently open
      if (this.modalContainer.classList.contains('active')) return;

      const interactiveObjects = [...new Set([...this.room.raycastObjects, ...this.room.pointerObjects])];
      if (interactiveObjects.length === 0) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(interactiveObjects, false);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const nameLower = clickedObject.name.toLowerCase();
        
        console.log('Object Clicked:', clickedObject.name);

        // Social Links
        if (nameLower.includes('github')) {
          window.open('https://github.com/naveendilhan', '_blank');
        } else if (nameLower.includes('linkedin')) {
          window.open('https://linkedin.com/in/your-profile', '_blank');
        } else if (nameLower.includes('instagram')) {
          window.open('https://instagram.com/your-profile', '_blank');
        } 
        
        // Modals
        if (nameLower.includes('works')) {
          this.openModal('works');
        } else if (nameLower.includes('about')) {
          this.openModal('about');
        } else if (nameLower.includes('contact')) {
          this.openModal('contact');
        }
      }
    });
  }

  addEventListeners() {
    window.addEventListener('resize', () => {
      this.size.width = window.innerWidth;
      this.size.height = window.innerHeight;

      this.renderer.setSize(this.size.width, this.size.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.camera.aspect = this.size.width / this.size.height;
      this.camera.updateProjectionMatrix();
    });
  }

  render() {
    const elapsedTime = this.clock.getElapsedTime();
    this.controls.update(); 

    if (this.room) {
      const interactiveObjects = [...new Set([...this.room.raycastObjects, ...this.room.pointerObjects])];
      
      if (interactiveObjects.length > 0) {
        // Reset scale every frame
        interactiveObjects.forEach(obj => {
          if (obj.userData.originalScale) {
            obj.userData.targetScale.copy(obj.userData.originalScale);
          }
        });

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
                                  nameLower.includes('contact');

          if (isPointerObject) {
            shouldShowPointer = true;
          }

          const isRaycastObject = nameLower.includes('raycaster') || 
                                  nameLower.includes('github') || 
                                  nameLower.includes('linkedin') || 
                                  nameLower.includes('instagram') ||
                                  nameLower.includes('works') ||
                                  nameLower.includes('about') ||
                                  nameLower.includes('contact');

          // Scale up by 5% when hovered
          if (isRaycastObject && hoveredObject.userData.originalScale) {
            hoveredObject.userData.targetScale.copy(hoveredObject.userData.originalScale).multiplyScalar(1.2);
          }
        }

        // Apply cursor style
        document.body.style.cursor = shouldShowPointer ? 'pointer' : 'default';
      }
    }

    this.room.update(elapsedTime);
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}