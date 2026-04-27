# My 3D Interactive Portfolio

A highly immersive, interactive 3D web-based portfolio that allows visitors to explore my professional work, skills, and links through a fully realized virtual room. Built purely with Vanilla JavaScript, Three.js, and Vite, this project focuses on high performance, custom shaders, and rich interactivity.

## 🌟 Key Features

* **Interactive 3D Environment**: Navigate a beautifully designed 3D room with smooth orbit controls.
* **Clickable Hotspots**: Interact with objects in the room (like the computer, pictures, and books) to open your "Works", "About", and "Contact" modals, or visit your GitHub, LinkedIn, and Instagram.
* **Day & Night Modes**: Seamlessly toggle between daytime lighting and night mode, complete with animated color and lighting transitions.
* **Dynamic Visual Effects**: Features custom WebGL shaders for realistic smoke, falling rain, and wind effects for swaying plants.
* **Immersive Audio**: Includes an integrated audio manager with background music and spatial sound effects (including a responsive meow when interacting with the room's cat).
* **Responsive & Mobile-Optimized**: Automatically detects mobile devices to gracefully disable heavy visual effects (like volumetric rain, smoke, and complex glass refractions) to ensure smooth performance across all platforms.
* **Video Integration**: Features a live video texture playing seamlessly on the 3D computer screen.

  ![My Portfolio Screenshot](./assets/app-screenshot.png)

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
```
## 🙏 Credits & Acknowledgments

This project utilizes several open-source libraries and incredible community assets. A huge thank you to the creators who made their work available and special thanks to ["Andrew Woan"](https://www.linkedin.com/in/andrewwoan/) for the guidance to make this project successful.

**3D Models**

* ["Bed"](https://sketchfab.com/3d-models/bed-b8c16d4b69f64335b46379b119b102b4) by [rickmaolly] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Office Sofa"](https://sketchfab.com/3d-models/office-sofa-25mb-43f927c7b2b2449ab924f4358a5e4340) by [Mehdi Shahsavan] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Sofa - Long Sofa"](https://sketchfab.com/3d-models/sofa-long-sofa-5c2ecc125237498fa610f928fc435db6) by [Lahcen.el] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Sofa"](https://sketchfab.com/3d-models/sofa-826c727451b441358e780d4651b2627e) by [Qu3st10n] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["sofa"](https://sketchfab.com/3d-models/sofa-33a982d268d749ddb803263ea7da84b0) by [MaX3Dd] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Bar Stool"](https://sketchfab.com/3d-models/bar-stool-518fe01989904bf48a4a04980bc578af) by [CommonSpence] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Stool"](https://sketchfab.com/3d-models/stool-7dcb7f5ddefa49949f3aa9feb68130c3) by [Oldmode] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Cupboard"](https://sketchfab.com/3d-models/cupboard-56b25c34c5e34f2c870516ce7af494c4) by [Lucas Garnier] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Cupboard"](https://sketchfab.com/3d-models/cupboard-2bad485236ba42fb8a2b195630def123) by [Viggo] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)



**Textures & Lighting (HDRI)**

* Environment lighting and HDRIs sourced from [Poly Haven](https://polyhaven.com/) (CC0 License).

* Texture Images sourced from [Poly Haven](https://polyhaven.com/) (CC0 License).



**Libraries & Tools**

* 3D rendering engine powered by [Three.js](https://threejs.org/) and [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/).

* UI components and icons provided by [Lucide React / Tailwind CSS].



## 📜 License

This project is licensed under the [MIT License](LICENSE.md) - see the LICENSE file for details.


