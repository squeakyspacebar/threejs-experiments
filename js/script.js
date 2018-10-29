function generateCube() {
  let geometry = new THREE.BoxGeometry(1, 1, 1);
  let material = new THREE.MeshBasicMaterial( { color: 0x0000ff });
  let mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function generateIcosahedron() {
  let geometry = new THREE.Geometry();

  // Calculate the golden ratio.
  let p = (1.0 + Math.sqrt(5.0)) / 2.0;

  // A regular icosahedron can be generated via three orthogonal rectangles
  // where the side lengths of each rectangle conform to the golden ratio.
  // The vertices are labeled for ease of creating faces.
  geometry.vertices.push(
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
    new THREE.Vector3( 1,  0, -p)  // 11
  );

  geometry.faces.push(
    // Faces centered around vertex 0.
    new THREE.Face3( 0,  1,  4),
    new THREE.Face3( 0,  4,  8),
    new THREE.Face3( 0,  8, 11),
    new THREE.Face3( 0, 11,  5),
    new THREE.Face3( 0,  5,  1),
    // Adjacent faces.
    new THREE.Face3( 1,  9,  4),
    new THREE.Face3( 4,  7,  8),
    new THREE.Face3( 8,  3, 11),
    new THREE.Face3(11,  6,  5),
    new THREE.Face3( 5, 10,  1),
    // Faces centered around vertex 2.
    new THREE.Face3( 2,  6,  3),
    new THREE.Face3( 2,  3,  7),
    new THREE.Face3( 2,  7,  9),
    new THREE.Face3( 2,  9, 10),
    new THREE.Face3( 2, 10,  6),
    // Adjacent faces.
    new THREE.Face3( 6, 11,  3),
    new THREE.Face3( 3,  8,  7),
    new THREE.Face3( 7,  4,  9),
    new THREE.Face3( 9,  1, 10),
    new THREE.Face3(10,  5,  6),
  );

  let material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  let mesh = new THREE.Mesh(geometry, material);

  return mesh;
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
    1000
  );

  // Initialize renderer.
  let renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
  document.body.appendChild(renderer.domElement);

  // Create polyhedral object.
  let poly = generateIcosahedron();

  var edgeGeometry = new THREE.EdgesGeometry(poly.geometry);
  var edgeMaterial = new THREE.LineBasicMaterial(
    {
      color: 0x00ffff,
      linewidth: 2
    }
  );
  var edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);

  // Add polyhedron to the scene.
  scene.add(poly);
  scene.add(edges);

  // Move camera to avoid coinciding with the object.
  camera.position.z = 5;

  // Run animation loop.
  (function loop() {
    window.requestAnimationFrame(loop);

    // Rotate object.
    poly.rotation.x += 0.01;
    poly.rotation.y += 0.01;
    edges.rotation.x += 0.01;
    edges.rotation.y += 0.01;

    renderer.render(scene, camera);
  })();
}

main();