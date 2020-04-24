let materialName = "earth";

const stellarClassification = {
  O: 0x9db4ff,
  B: 0xaabfff,
  A: 0xcad8ff,
  F: 0xf8f7ff,
  G: 0xfff2a1,
  K: 0xffeecc,
  M: 0xffd2a1,
};

async function loadTextures() {
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

  const textureMap = {};

  console.log("Loading textures...");
  const loadPromises = [];
  for (const [mapType, maps] of Object.entries(texturePaths)) {
    textureMap[mapType] = {};

    for (const [mapName, filePath] of Object.entries(maps)) {
      const loadPromise = new Promise(function (resolve, reject) {
        const loader = new THREE.TextureLoader();

        console.log(`Loading ${filePath}...`);
        loader.load(filePath, function (texture) {
          textureMap[mapType][mapName] = texture;
          console.log(`${filePath} loaded.`);
          resolve(texture);
        });
      });

      loadPromises.push(loadPromise);
    }
  }

  await Promise.all(loadPromises).then(function () {
    console.log("Finished loading textures.");
  });

  return textureMap;
}

function generateIcosahedron(materialOptions) {
  const geometry = new THREE.Geometry();

  // Calculate the golden ratio.
  const p = (1.0 + Math.sqrt(5.0)) / 2.0;

  const vertices = [
    new THREE.Vector3(0, p, -1), // 0
    new THREE.Vector3(0, p, 1), // 1
    new THREE.Vector3(0, -p, 1), // 2
    new THREE.Vector3(0, -p, -1), // 3
    // Rectangle 2
    new THREE.Vector3(-p, 1, 0), // 4
    new THREE.Vector3(p, 1, 0), // 5
    new THREE.Vector3(p, -1, 0), // 6
    new THREE.Vector3(-p, -1, 0), // 7
    // Rectangle 3
    new THREE.Vector3(-1, 0, -p), // 8
    new THREE.Vector3(-1, 0, p), // 9
    new THREE.Vector3(1, 0, p), // 10
    new THREE.Vector3(1, 0, -p), // 11
  ];

  const faces = [
    // Faces centered around vertex 0.
    new THREE.Face3(4, 1, 0),
    new THREE.Face3(8, 4, 0),
    new THREE.Face3(11, 8, 0),
    new THREE.Face3(5, 11, 0),
    new THREE.Face3(1, 5, 0),
    // Adjacent faces.
    new THREE.Face3(4, 9, 1),
    new THREE.Face3(8, 7, 4),
    new THREE.Face3(11, 3, 8),
    new THREE.Face3(5, 6, 11),
    new THREE.Face3(1, 10, 5),
    // Faces centered around vertex 2.
    new THREE.Face3(3, 6, 2),
    new THREE.Face3(7, 3, 2),
    new THREE.Face3(9, 7, 2),
    new THREE.Face3(10, 9, 2),
    new THREE.Face3(6, 10, 2),
    // Adjacent faces.
    new THREE.Face3(3, 11, 6),
    new THREE.Face3(7, 8, 3),
    new THREE.Face3(9, 4, 7),
    new THREE.Face3(10, 1, 9),
    new THREE.Face3(6, 5, 10),
  ];

  // A regular icosahedron can be generated via three orthogonal rectangles
  // where the side lengths of each rectangle conform to the golden ratio.
  // The vertices are labeled for ease of creating faces.
  geometry.vertices = vertices;
  geometry.faces = faces;

  // Refine icosahedron.
  const level = 4;
  for (let i = 0; i < level; i++) {
    refineIcosahedron(geometry);
  }

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  const material = new THREE.MeshPhongMaterial(materialOptions);
  const mesh = new THREE.Mesh(sphere, material);

  return mesh;
}

function generateSphere(materialOptions) {
  const sphere = new THREE.SphereGeometry(2, 64, 64);
  const material = new THREE.MeshPhongMaterial(materialOptions);
  const mesh = new THREE.Mesh(sphere, material);

  return mesh;
}

function refineIcosahedron(geometry) {
  // Initialize array to hold new subdivided faces.
  const updatedFaces = [];

  const faceCount = geometry.faces.length;
  for (let i = 0; i < faceCount; i++) {
    const face = geometry.faces[i];

    // Get subdivided faces.
    const newFaces = subdivideFace(face, geometry);

    // Push subdivided faces to new array.
    const newFacesCount = newFaces.length;
    for (var j = 0; j < newFacesCount; j++) {
      updatedFaces.push(newFaces[j]);
    }
  }

  // Replace previous faces with updated ones.
  geometry.faces = updatedFaces;

  return geometry;
}

function subdivideFace(face, geometry) {
  // Retrieve vertices of the given face.
  const v1 = geometry.vertices[face.a];
  const v2 = geometry.vertices[face.b];
  const v3 = geometry.vertices[face.c];

  // Add midpoints of each edge to the geometry.
  const mid1 = addMidpoint(v1, v2, geometry);
  const mid2 = addMidpoint(v2, v3, geometry);
  const mid3 = addMidpoint(v3, v1, geometry);

  // Create new faces with the new vertices.
  const newFaces = [
    new THREE.Face3(face.a, mid1, mid3),
    new THREE.Face3(mid1, face.b, mid2),
    new THREE.Face3(mid3, mid2, face.c),
    new THREE.Face3(mid3, mid1, mid2),
  ];

  return newFaces;
}

function getMidpoint(v1, v2) {
  return new THREE.Vector3(
    (v1.x + v2.x) / 2.0,
    (v1.y + v2.y) / 2.0,
    (v1.z + v2.z) / 2.0
  );
}

function addMidpoint(v1, v2, geometry) {
  const midpoint = getMidpoint(v1, v2);

  // Calculate factor to scale new vertex to desired spherical radius.
  const scalingFactor = v1.length() / midpoint.length();

  // Create a scaled midpoint vector.
  const scaledVector = midpoint.multiplyScalar(scalingFactor);

  // Set index for latest vector.
  const newIndex = geometry.vertices.length;

  // Add latest vector to geometry.
  geometry.vertices.push(scaledVector);

  return newIndex;
}

function updateMeshMaterial(mesh, materialOptions) {
  mesh.material = Object.assign(mesh.material, materialOptions);
  mesh.material.needsUpdate = true;
}

function generateMaterialOptions(materialName) {
  const diffuseMap =
    materialName in textureMaps.diffuse && textureMaps.diffuse[materialName];
  const bumpMap =
    materialName in textureMaps.bump && textureMaps.bump[materialName];
  const specularMap =
    materialName in textureMaps.specular && textureMaps.specular[materialName];

  const materialOptions = {};
  diffuseMap != null && (materialOptions.map = diffuseMap);
  bumpMap != null && (materialOptions.bumpMap = bumpMap);
  specularMap != null && (materialOptions.specularMap = specularMap);

  return materialOptions;
}

async function main() {
  const config = {
    highlightEdges: false,
    highlightVertices: false,
  };

  textureMaps = await loadTextures();

  // Initialize scene.
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x404040);

  const sceneObjects = [];

  // Initialize camera.
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Initialize renderer.
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
  document.body.appendChild(renderer.domElement);

  // Create polyhedral object.
  const materialOptions = generateMaterialOptions(materialName);
  const poly = generateSphere(materialOptions);
  sceneObjects.push(poly);

  // Move camera to avoid coinciding with the object.
  camera.position.z = 4;

  // Add polyhedron to the scene.
  scene.add(poly);

  // Create edge highlighting.
  if (config.highlightEdges) {
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 1,
    });
    const edges = new THREE.LineSegments(poly.geometry, edgeMaterial);

    // Add edge highlighting to scene.
    scene.add(edges);
    sceneObjects.push(edges);
  }

  // Create vertex highlighting.
  if (config.highlightVertices) {
    const pointMaterial = new THREE.PointsMaterial({
      color: 0x0000ff,
      size: 5,
      sizeAttenuation: false,
    });
    const points = new THREE.Points(poly.geometry, pointMaterial);

    // Add vertex highlighting to scene.
    scene.add(points);
    sceneObjects.push(points);
  }

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const directLight = new THREE.DirectionalLight(0xcccccc, 1);
  directLight.position.set(5, 5, 5);
  scene.add(directLight);

  // Prepare variables for use in the loop.
  let currentMaterialName = materialName;

  // Run animation loop.
  (function loop() {
    window.requestAnimationFrame(loop);

    if (materialName != currentMaterialName) {
      const newMaterialOptions = generateMaterialOptions(materialName);
      poly.material = Object.assign(poly.material, newMaterialOptions);
      poly.material.needsUpdate = true;
    }

    // Rotate object.
    for (const object of sceneObjects) {
      //object.rotation.x += 0.01;
      object.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
  })();
}

main();
