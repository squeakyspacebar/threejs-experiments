"use strict";

import {
  AmbientLight,
  Color,
  DirectionalLight,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from "three";
import { AstroBodyFactory } from "AstroBodyFactory";

async function main() {
  const config = {
    highlightEdges: false,
    highlightVertices: false,
    displayBody: "earth",
  };

  // Initialize scene.
  const scene = new Scene();
  scene.background = new Color(0x555555);
  const sceneObjects = [];

  // Initialize camera.
  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Move camera to avoid coinciding with the object.
  camera.position.z = 4;

  // Initialize renderer.
  const renderer = new WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);
  document.body.appendChild(renderer.domElement);

  // Create polyhedron.
  let astroBody = await AstroBodyFactory[config.displayBody]();

  // Add polyhedron to the scene.
  scene.add(astroBody);
  sceneObjects.push(astroBody);

  // Create edge highlighting.
  if (config.highlightEdges) {
    const edgeMaterial = new LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 1,
    });
    const edges = new LineSegments(poly.geometry, edgeMaterial);

    // Add edge highlighting to scene.
    scene.add(edges);
    sceneObjects.push(edges);
  }

  // Create vertex highlighting.
  if (config.highlightVertices) {
    const pointMaterial = new PointsMaterial({
      color: 0x0000ff,
      size: 5,
      sizeAttenuation: false,
    });
    const points = new Points(poly.geometry, pointMaterial);

    // Add vertex highlighting to scene.
    scene.add(points);
    sceneObjects.push(points);
  }

  const ambientLight = new AmbientLight(0xffffff);
  scene.add(ambientLight);

  const directLight = new DirectionalLight(0xcccccc, 1);
  directLight.position.set(5, 5, 5);
  scene.add(directLight);

  // Run animation loop.
  (function loop() {
    window.requestAnimationFrame(loop);

    // Rotate object.
    for (const object of sceneObjects) {
      //object.rotation.x += 0.01;
      object.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
  })();
}

main();
