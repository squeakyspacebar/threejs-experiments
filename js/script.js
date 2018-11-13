'use strict';

let THREE = require('three');
let shapes = require('shapes');

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
  let poly = shapes.icosahedron();
  // Scale polyhedron to fit within a unit circumscribed sphere.
  poly.projectVertices();

  // Move camera to avoid coinciding with the object.
  camera.position.z = 4;

  // Refine icosahedron.
  let level = 0;
  for (let i = 0; i < level; i++) {
    poly = refine();
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
  let edges = new THREE.LineSegments(poly.mesh.geometry, edgeMaterial);

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
  let points = new THREE.Points(poly.mesh.geometry, pointMaterial);

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
