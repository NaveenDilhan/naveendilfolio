# 3D Interactive Portfolio

A highly immersive, interactive 3D web-based portfolio that allows visitors to explore my professional work, skills, and links through a fully realized virtual room. Built purely with Vanilla JavaScript, Three.js, and Vite, this project focuses on high performance, custom shaders, and rich interactivity.

## 🌟 Key Features

* **Interactive 3D Environment**: Navigate a beautifully designed 3D room with smooth orbit controls.
* **Clickable Hotspots**: Interact with objects in the room (like the computer, pictures, and books) to open your "Works", "About", and "Contact" modals, or visit your GitHub, LinkedIn, and Instagram.
* **Day & Night Modes**: Seamlessly toggle between daytime lighting and night mode, complete with animated color and lighting transitions.
* **Dynamic Visual Effects**: Features custom WebGL shaders for realistic smoke, falling rain, and wind effects for swaying plants.
* **Immersive Audio**: Includes an integrated audio manager with background music and spatial sound effects (including a responsive meow when interacting with the room's cat).
* **Responsive & Mobile-Optimized**: Automatically detects mobile devices to gracefully disable heavy visual effects (like volumetric rain, smoke, and complex glass refractions) to ensure smooth performance across all platforms.
* **Video Integration**: Features a live video texture playing seamlessly on the 3D computer screen.

## 🛠️ Tech Stack

**Frontend & Tooling**
* [Vanilla JavaScript (ES6+)]()
* [Vite](https://vitejs.dev/) (Build tool & development server)
* [Sass](https://sass-lang.com/) (Styling)

**3D Rendering & Animation**
* [Three.js](https://threejs.org/) (Core 3D Engine)
* [GSAP](https://gsap.com/) (For smooth camera movements and UI animations)
* **Loaders & Optimization**: GLTFLoader, DRACOLoader (for compressed 3D models), and KTX2Loader (for highly compressed GPU textures).

## 📂 Project Structure

```text
my-portfolio/
├── public/                 # Static assets (Not processed by Vite)
│   ├── audio/              # Background music and SFX
│   ├── models/             # Compressed .glb 3D models of the room
│   ├── textures/           # High-performance KTX2 textures and Skybox
│   └── shaders/            # Custom shader textures (e.g., perlin noise)
├── src/                    # Source code
│   ├── App.js              # Core application state, camera, and render loop
│   ├── Room.js             # 3D scene setup, custom materials, and object interactions
│   ├── AudioManager.js     # Audio handling and volume controls
│   ├── config.js           # Configuration variables and camera views
│   ├── main.js             # Application entry point
│   └── style.scss          # Global styles and modal UI
├── index.html              # Main HTML entry
└── package.json            # Project dependencies and scripts
