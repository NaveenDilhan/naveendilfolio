import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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

    // Update Room animations (Fans spinning, RGB colors)
    this.room.update(elapsedTime);

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}