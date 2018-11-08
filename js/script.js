'use strict';

function generatePolyhedron(vertices, faces, material) {
  let geometry = new THREE.Geometry();

  geometry.vertices = vertices;
  geometry.faces = faces;

  let mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function generateIcosahedron() {
  // Calculate the golden ratio.
  let p = (1.0 + Math.sqrt(5.0)) / 2.0;

  // A regular icosahedron can be generated via three orthogonal rectangles
  // where the side lengths of each rectangle conform to the golden ratio.
  let vertices = [
    // Rectangle 1
    new THREE.Vector3( 0,  p, -1), // 0
    new THREE.Vector3( 0,  p,  1), // 1
    new THREE.Vector3( 0, -p,  1), // 2
    new THREE.Vector3( 0, -p, -1), // 3
    // Rectangle 2
    new THREE.Vector3(-p,  1,  0), // 4
    new THREE.Vector3( p,  1,  0), // 5
    new THREE.Vector3( p, -1,  0), // 6
    new THREE.Vector3(-p, -1,  0), // 7
    // Rectangle 3
    new THREE.Vector3(-1,  0, -p), // 8
    new THREE.Vector3(-1,  0,  p), // 9
    new THREE.Vector3( 1,  0,  p), // 10
    new THREE.Vector3( 1,  0, -p), // 11
  ];

  let faces = [
    // Faces centered around vertex 0.
    new THREE.Face3( 4,  1,  0),
    new THREE.Face3( 8,  4,  0),
    new THREE.Face3(11,  8, 0),
    new THREE.Face3( 5, 11,  0),
    new THREE.Face3( 1,  5,  0),
    // Adjacent faces.
    new THREE.Face3( 4,  9,  1),
    new THREE.Face3( 8,  7,  4),
    new THREE.Face3(11,  3,  8),
    new THREE.Face3( 5,  6, 11),
    new THREE.Face3( 1, 10,  5),
    // Faces centered around vertex 2.
    new THREE.Face3( 3,  6,  2),
    new THREE.Face3( 7,  3,  2),
    new THREE.Face3( 9,  7,  2),
    new THREE.Face3(10,  9,  2),
    new THREE.Face3( 6, 10,  2),
    // Adjacent faces.
    new THREE.Face3( 3, 11,  6),
    new THREE.Face3( 7,  8,  3),
    new THREE.Face3( 9,  4,  7),
    new THREE.Face3(10,  1,  9),
    new THREE.Face3( 6,  5, 10),
  ];

  let material = new THREE.MeshBasicMaterial({ color: 0xee00ee });
  let mesh = generatePolyhedron(vertices, faces, material);

  return mesh;
}

function refinePolyhedron(mesh) {
  // Initialize array to hold new subdivided faces.
  let updatedFaces = [];

  let faceCount = mesh.geometry.faces.length;
  for (let i = 0; i < faceCount; i++) {
    let face = mesh.geometry.faces[i];

    // Get subdivided faces.
    let newFaces = subdivideFace(face, mesh);

    // Push subdivided faces to new array.
    let newFacesCount = newFaces.length;
    for (var j = 0; j < newFacesCount; j++) {
      updatedFaces.push(newFaces[j]);
    }
  }

  // Replace previous faces with updated ones.
  mesh.geometry.faces = updatedFaces;

  return mesh;
}

function subdivideFace(face, mesh) {
  // Retrieve vertices of the given face.
  let v1 = mesh.geometry.vertices[face.a];
  let v2 = mesh.geometry.vertices[face.b];
  let v3 = mesh.geometry.vertices[face.c];

  // Add midpoints of each edge to the mesh.
  let mid1 = addMidpointToMesh(v1, v2, mesh);
  let mid2 = addMidpointToMesh(v2, v3, mesh);
  let mid3 = addMidpointToMesh(v3, v1, mesh);

  // Create new faces with the new vertices.
  let newFaces = [
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

function addMidpointToMesh(v1, v2, mesh, circumRadius = 1.0) {
  let midpoint = getMidpoint(v1, v2);

  // Calculate factor to scale new vertex to desired spherical radius.
  let scalingFactor = circumRadius / midpoint.length();

  // Create a scaled midpoint vector.
  let scaledVector = midpoint.multiplyScalar(scalingFactor);

  // Set index for latest vector.
  let newIndex = mesh.geometry.vertices.length;

  // Add latest vector to mesh.
  mesh.geometry.vertices.push(scaledVector);

  return newIndex;
}

function projectedVertices(mesh, circumRadius = 1.0) {
  let vertices = mesh.geometry.vertices;
  let projectedVertices = [];

  let verticesCount = vertices.length;
  for (let i = 0; i < verticesCount; i++) {
    let scalingFactor = circumRadius / vertices[i].length();
    projectedVertices.push(vertices[i].multiplyScalar(scalingFactor));
  }

  return projectedVertices;
}

function main() {
  // Initialize scene.
  let scene = new THREE.Scene();
  scene.background = new THREE.Color(0x555555);

  // Initialize camera.
  let camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  // Initialize renderer.
  let renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.75, window.innerHeight * 0.75);
  document.body.appendChild(renderer.domElement);

  // Create polyhedron.
  let poly = generateIcosahedron();
  // Scale polyhedron to fit within a unit circumscribed sphere.
  poly.vertices = projectedVertices(poly);

  // Move camera to avoid coinciding with the object.
  camera.position.z = 4;

  // Refine icosahedron.
  let level = 0;
  for (let i = 0; i < level; i++) {
    poly = refinePolyhedron(poly);
  }

  // Add polyhedron to the scene.
  scene.add(poly);

  // Create edge highlighting.
  let edgeMaterial = new THREE.LineBasicMaterial(
    {
      color: 0x00ffff,
      linewidth: 1,
    }
  );
  let edges = new THREE.LineSegments(poly.geometry, edgeMaterial);

  // Add edge highlighting to scene.
  scene.add(edges);

  // Create vertex highlighting.
  let pointMaterial = new THREE.PointsMaterial(
    {
      color: 0x0000ff,
      size: 5,
      sizeAttenuation: false,
    }
  );
  let points = new THREE.Points(poly.geometry, pointMaterial);

  // Add vertex highlighting to scene.
  scene.add(points);

  // Run animation loop.
  (function loop() {
    window.requestAnimationFrame(loop);

    // Rotate object.
    poly.rotation.x += 0.01;
    poly.rotation.y += 0.01;
    edges.rotation.x += 0.01;
    edges.rotation.y += 0.01;
    points.rotation.x += 0.01;
    points.rotation.y += 0.01;

    renderer.render(scene, camera);
  })();
}

main();