"use strict";

import { Mesh, MeshPhongMaterial, SphereGeometry, TextureLoader } from "three";

function AstroBodyFactory() {}

const stellarTypeColorMap = {
  O: 0x9db4ff,
  B: 0xaabfff,
  A: 0xcad8ff,
  F: 0xf8f7ff,
  G: 0xfff2a1,
  K: 0xffeecc,
  M: 0xffd2a1,
};

AstroBodyFactory.textureMaps;

AstroBodyFactory.loadTextures = async function () {
  const diffuseMapDirPath = "assets/diffuse-maps";
  const bumpMapDirPath = "assets/bump-maps";
  const specularMapDirPath = "assets/specular-maps";

  const texturePaths = {
    diffuse: {
      sun: `${diffuseMapDirPath}/sunmap.jpg`,
      mercury: `${diffuseMapDirPath}/mercurymap.jpg`,
      venus: `${diffuseMapDirPath}/venusmap.jpg`,
      earth: `${diffuseMapDirPath}/earthmap.jpg`,
      moon: `${diffuseMapDirPath}/moonmap.jpg`,
      mars: `${diffuseMapDirPath}/marsmap.jpg`,
      jupiter: `${diffuseMapDirPath}/jupitermap.jpg`,
      saturn: `${diffuseMapDirPath}/saturnmap.jpg`,
      uranus: `${diffuseMapDirPath}/uranusmap.jpg`,
      neptune: `${diffuseMapDirPath}/neptunemap.jpg`,
    },
    bump: {
      mercury: `${bumpMapDirPath}/mercurybump.jpg`,
      venus: `${bumpMapDirPath}/venusbump.jpg`,
      earth: `${bumpMapDirPath}/earthbump.jpg`,
      mars: `${bumpMapDirPath}/marsbump.jpg`,
    },
    specular: {
      earth: `${specularMapDirPath}/earthspec.jpg`,
    },
  };

  console.log("Loading textures.");
  const textureMaps = {};
  const loadPromises = [];
  for (const [mapType, maps] of Object.entries(texturePaths)) {
    textureMaps[mapType] = {};

    for (const [mapName, filePath] of Object.entries(maps)) {
      const loadPromise = new Promise(function (resolve, reject) {
        const loader = new TextureLoader();

        console.log(`Loading ${filePath}.`);
        loader.load(
          filePath,
          function (texture) {
            textureMaps[mapType][mapName] = texture;
            console.log(`Loaded ${filePath}.`);
            // This call must come last.
            resolve(texture);
          },
          null,
          function (error) {
            console.error(error);
          }
        );
      });

      loadPromises.push(loadPromise);
    }
  }

  await Promise.all(loadPromises)
    .then(function () {
      console.log("Finished loading textures.");
    })
    .catch((error) => {
      console.error(error.message);
    });

  return textureMaps;
};

AstroBodyFactory.generateMaterialConfig = async function (materialName) {
  const textureMaps = await AstroBodyFactory.loadTextures();
  AstroBodyFactory.textureMaps = textureMaps;

  const diffuseMap =
    materialName in textureMaps.diffuse && textureMaps.diffuse[materialName];
  const bumpMap =
    materialName in textureMaps.bump && textureMaps.bump[materialName];
  const specularMap =
    materialName in textureMaps.specular && textureMaps.specular[materialName];

  const materialConfig = {};
  diffuseMap != null && (materialConfig.map = diffuseMap);
  bumpMap != null && (materialConfig.bumpMap = bumpMap);
  specularMap != null && (materialConfig.specularMap = specularMap);

  return materialConfig;
};

AstroBodyFactory.generateSphere = function (materialConfig) {
  const sphere = new SphereGeometry(2, 64, 64);
  const material = new MeshPhongMaterial(materialConfig);
  const mesh = new Mesh(sphere, material);

  return mesh;
};

AstroBodyFactory.earth = async function () {
  console.log("Creating earth object.");
  const materialConfig = await AstroBodyFactory.generateMaterialConfig("earth");
  console.log(materialConfig);
  const earthMesh = AstroBodyFactory.generateSphere(materialConfig);
  earthMesh.name = "earth";
  console.log(earthMesh);

  return earthMesh;
};

export { AstroBodyFactory };
