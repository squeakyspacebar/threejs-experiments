'use strict';

let THREE = require('three');

function Polyhedron(vertices, faces, material) {
  let geometry = new THREE.Geometry();

  geometry.vertices = vertices;
  geometry.faces = faces;

  this.mesh = new THREE.Mesh(geometry, material);
}

function ConvexDeltahedron(vertices, faces, material) {
  // Call parent constructor.
  Polyhedron.call(this, vertices, faces, material);
}

// Extend Polyhedron class.
ConvexDeltahedron.prototype = Object.create(Polyhedron.prototype);
ConvexDeltahedron.prototype.constructor = ConvexDeltahedron;

ConvexDeltahedron.prototype.refine = function() {
  let self = this;

  // Initialize array to hold new subdivided faces.
  let updatedFaces = [];

  let faceCount = self.mesh.geometry.faces.length;
  for (let i = 0; i < faceCount; i++) {
    let face = self.mesh.geometry.faces[i];

    // Get subdivided faces.
    let newFaces = self.subdivideFace(face);

    // Push subdivided faces to new array.
    let newFacesCount = newFaces.length;
    for (var j = 0; j < newFacesCount; j++) {
      updatedFaces.push(newFaces[j]);
    }
  }

  // Replace previous faces with updated ones.
  self.mesh.geometry.faces = updatedFaces;
}

ConvexDeltahedron.prototype.subdivideFace = function(face) {
  let self = this;

  // Retrieve vertices of the given face.
  let v1 = self.mesh.geometry.vertices[face.a];
  let v2 = self.mesh.geometry.vertices[face.b];
  let v3 = self.mesh.geometry.vertices[face.c];

  // Add midpoints of each edge to the mesh.
  let mid1 = self.addMidpoint(v1, v2, self.mesh);
  let mid2 = self.addMidpoint(v2, v3, self.mesh);
  let mid3 = self.addMidpoint(v3, v1, self.mesh);

  // Create new faces with the new vertices.
  let newFaces = [
    new THREE.Face3(face.a, mid1, mid3),
    new THREE.Face3(mid1, face.b, mid2),
    new THREE.Face3(mid3, mid2, face.c),
    new THREE.Face3(mid3, mid1, mid2),
  ];

  return newFaces;
}

ConvexDeltahedron.prototype.addMidpoint = function(v1, v2) {
  let self = this;

  let midpoint = self.getMidpoint(v1, v2);

  // Calculate factor to scale new vertex to desired spherical radius.
  let scalingFactor = self.circumRadius / midpoint.length();

  // Create a scaled midpoint vector.
  let scaledVector = midpoint.multiplyScalar(scalingFactor);

  // Set index for latest vector.
  let newIndex = self.mesh.geometry.vertices.length;

  // Add latest vector to mesh.
  self.mesh.geometry.vertices.push(scaledVector);

  return newIndex;
}

ConvexDeltahedron.prototype.getMidpoint = function(v1, v2) {
  return new THREE.Vector3(
    (v1.x + v2.x) / 2.0,
    (v1.y + v2.y) / 2.0,
    (v1.z + v2.z) / 2.0
  );
}

ConvexDeltahedron.prototype.projectVertices = function(circumRadius = 1.0) {
  let self = this;

  let vertices = self.mesh.geometry.vertices;
  let projectedVertices = [];

  let verticesCount = vertices.length;
  for (let i = 0; i < verticesCount; i++) {
    let scalingFactor = circumRadius / vertices[i].length();
    projectedVertices.push(vertices[i].multiplyScalar(scalingFactor));
  }

  self.vertices = projectedVertices;
}

function PolyhedronFactory() {}

PolyhedronFactory.prototype.icosahedron = function(materialConfiguration) {
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

  let material = new THREE.MeshBasicMaterial(materialConfiguration);
  let polyhedron = new ConvexDeltahedron(vertices, faces, material);

  return polyhedron;
}

module.exports = {
  Polyhedron: Polyhedron,
  ConvexDeltahedron: ConvexDeltahedron,
  PolyhedronFactory: PolyhedronFactory
};