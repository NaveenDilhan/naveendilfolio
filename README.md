# My 3D Interactive Portfolio

A highly immersive, interactive 3D web-based portfolio that allows visitors to explore my professional work, skills, and links through a fully realised virtual room. Built purely with Vanilla JavaScript, Three.js, and Vite, this project focuses on high performance, custom shaders, and rich interactivity.

## 🌟 Key Features

* **Interactive 3D Environment**: Navigate a beautifully designed 3D room with smooth orbit controls.
* **Clickable Hotspots**: Interact with objects in the room (like the computer, pictures, and books) to open your "Works", "About", and "Contact" modals, or visit your GitHub, LinkedIn, and Instagram.
* **Day & Night Modes**: Seamlessly toggle between daytime lighting and night mode, complete with animated color and lighting transitions.
* **Dynamic Visual Effects**: Features custom WebGL shaders for realistic smoke, falling rain, and wind effects for swaying plants.
* **Immersive Audio**: Includes an integrated audio manager with background music and spatial sound effects (including a responsive meow when interacting with the room's cat).
* **Responsive & Mobile-Optimised**: Automatically detects mobile devices to gracefully disable heavy visual effects (like volumetric rain, smoke, and complex glass refractions) to ensure smooth performance across all platforms.
* **Video Integration**: Features a live video texture playing seamlessly on the 3D computer screen.

 ![My Portfolio Screenshot](./client/public/media/Portfolio.png)

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

This project utilises several open-source libraries and incredible community assets. A huge thank you to the creators who made their work available, and special thanks to [Andrew Woan](https://www.linkedin.com/in/andrewwoan/) for the guidance to make this project successful.

**3D Models & Sound Design**

* ["Hollow Knight Fanart"](https://sketchfab.com/3d-models/hollow-knight-fanart-aee54b0967114f4699ba25a77d467eac) by [Guilherme Lé] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Pochita"](https://sketchfab.com/3d-models/pochita-91023b6e85b4463eacad786496c233a0) by [ARKON MAREK] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Stylized Speakers"](https://sketchfab.com/3d-models/stylized-speakers-ed6ba07891b948b8adca81e81b35c4be) by [Other.Dimension] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["3December 2021 Day 10: Cat"](https://sketchfab.com/3d-models/3december-2021-day-10-cat-3fe220696e194ee18c045e8ab3072510) by [Liberi Arcano] on Sketchfab - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

* ["Happy Lo-Fi (Lofi Collection)"](https://opengameart.org/content/happy-lo-fi-lofi-collection) by [Holizna] on OpenGameArt.Org - Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)
 
**Textures & Lighting (HDRI)**

* Texture Images sourced from [Poly Haven](https://polyhaven.com/) (CC0 License).

**Libraries & Tools**

* 3D rendering engine powered by [Three.js](https://threejs.org/) and [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/).

* UI components and icons provided by [Lucide React / Tailwind CSS].

## 📜 License

This project is licensed under the [MIT License](LICENSE.md) - see the LICENSE file for details.


