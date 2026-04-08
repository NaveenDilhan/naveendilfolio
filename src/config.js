import * as THREE from 'three';

export const CAMERA_VIEWS = {
  desktop: {
    position: new THREE.Vector3(12.61, 8.83, 12.61),
    target: new THREE.Vector3(0.09, 3.59, -1.11)
  },
  mobile: {
    position: new THREE.Vector3(34.45, 22.70, 22.42),
    target: new THREE.Vector3(-0.08, 3.31, -0.74)
  }
};

export const TEXTURE_MAP = {
  First:  { day: "/textures/room/FirstImageTexture.ktx2", night: "/textures/room/FirstImageTextureNight.ktx2" },
  Second: { day: "/textures/room/SecondImageTexture.ktx2", night: "/textures/room/SecondImageTextureNight.ktx2" },
  Third:  { day: "/textures/room/ThirdImageTexture.ktx2", night: "/textures/room/ThirdImageTextureNight.ktx2" },
  Fourth: { day: "/textures/room/FourthImageTexture.ktx2", night: "/textures/room/FourthImageTextureNight.ktx2" },
  Fifth:  { day: "/textures/room/FifthImageTexture.ktx2", night: "/textures/room/FifthImageTextureNight.ktx2" },
  Sixth:  { day: "/textures/room/SixthImageTexture.ktx2", night: "/textures/room/SixthImageTextureNight.ktx2" },
  Seventh:{ day: "/textures/room/SeventhImageTexture.ktx2", night: "/textures/room/SeventhImageTextureNight.ktx2" },
};