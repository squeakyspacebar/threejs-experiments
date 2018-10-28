function generateCube() {
  let geometry = new THREE.BoxGeometry(1, 1, 1);
  let material = new THREE.MeshBasicMaterial( { color: 0x0000ff });
  let cube = new THREE.Mesh(geometry, material);
  return cube;
}

function main() {
  // Initialize scene.
  let scene = new THREE.Scene();

  // Initialize camera.
  let camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Initialize renderer.
  let renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
  document.body.appendChild(renderer.domElement);

  // Create cube object.
  let cube = generateCube();

  // Add cube to the scene.
  scene.add(cube);

  // Move camera to avoid coinciding with the cube.
  camera.position.z = 3;

  // Run animation loop.
  (function loop() {
    renderer.render(scene, camera);
    window.requestAnimationFrame(loop);
  })();
}

main();