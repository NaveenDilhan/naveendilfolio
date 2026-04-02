import * as THREE from 'three';

export const CAMERA_VIEWS = {
  desktop: {
    position: new THREE.Vector3(12.61, 8.83, 12.61),
    target: new THREE.Vector3(0.09, 3.59, -1.11)
  },
  mobile: {
    position: new THREE.Vector3(11.68, 14.01, 31.37),
    target: new THREE.Vector3(-0.08, 3.31, -0.74)
  }
};

export const TEXTURE_MAP = {
  First:  { day: "/textures/room/FirstImageTexture.webp" },
  Second: { day: "/textures/room/SecondImageTexture.webp" },
  Third:  { day: "/textures/room/ThirdImageTexture.webp" },
  Fourth: { day: "/textures/room/FourthImageTexture.webp" },
  Fifth:  { day: "/textures/room/FifthImageTexture.webp" },
  Sixth:  { day: "/textures/room/SixthImageTexture.webp" },
  Seventh:{ day: "/textures/room/SeventhImageTexture.webp" },
};