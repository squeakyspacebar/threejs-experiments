"use strict";

import {
  Face3,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  SphereGeometry,
  Vector3,
} from "three";

function Polyhedron(vertices, faces, material) {
  const geometry = new Geometry();

  geometry.vertices = vertices;
  geometry.faces = faces;

  this.mesh = new Mesh(geometry, material);
}

function Sphere(sphereGeometry, material) {
  const geometry = new SphereGeometry(...sphereGeometry);

  this.mesh = new Mesh(geometry, material);
}

function ConvexDeltahedron(vertices, faces, material) {
  // Call parent constructor.
  Polyhedron.call(this, vertices, faces, material);
}

// Extend Polyhedron class.
ConvexDeltahedron.prototype = Object.create(Polyhedron.prototype);
ConvexDeltahedron.prototype.constructor = ConvexDeltahedron;

ConvexDeltahedron.prototype.refine = function () {
  const self = this;

  // Initialize array to hold new subdivided faces.
  const updatedFaces = [];

  const faceCount = self.mesh.geometry.faces.length;
  for (let i = 0; i < faceCount; i++) {
    const face = self.mesh.geometry.faces[i];

    // Get subdivided faces.
    const newFaces = self.subdivideFace(face);

    // Push subdivided faces to new array.
    const newFacesCount = newFaces.length;
    for (var j = 0; j < newFacesCount; j++) {
      updatedFaces.push(newFaces[j]);
    }
  }

  // Replace previous faces with updated ones.
  self.mesh.geometry.faces = updatedFaces;
};

ConvexDeltahedron.prototype.subdivideFace = function (face) {
  const self = this;

  // Retrieve vertices of the given face.
  const v1 = self.mesh.geometry.vertices[face.a];
  const v2 = self.mesh.geometry.vertices[face.b];
  const v3 = self.mesh.geometry.vertices[face.c];

  // Add midpoints of each edge to the mesh.
  const mid1 = self.addMidpoint(v1, v2, self.mesh);
  const mid2 = self.addMidpoint(v2, v3, self.mesh);
  const mid3 = self.addMidpoint(v3, v1, self.mesh);

  // Create new faces with the new vertices.
  const newFaces = [
    new Face3(face.a, mid1, mid3),
    new Face3(mid1, face.b, mid2),
    new Face3(mid3, mid2, face.c),
    new Face3(mid3, mid1, mid2),
  ];

  return newFaces;
};

ConvexDeltahedron.prototype.addMidpoint = function (v1, v2) {
  const self = this;

  const midpoint = self.getMidpoint(v1, v2);

  // Calculate factor to scale new vertex to desired spherical radius.
  const scalingFactor = self.circumRadius / midpoint.length();

  // Create a scaled midpoint vector.
  const scaledVector = midpoint.multiplyScalar(scalingFactor);

  // Set index for latest vector.
  const newIndex = self.mesh.geometry.vertices.length;

  // Add latest vector to mesh.
  self.mesh.geometry.vertices.push(scaledVector);

  return newIndex;
};

ConvexDeltahedron.prototype.getMidpoint = function (v1, v2) {
  return new Vector3(
    (v1.x + v2.x) / 2.0,
    (v1.y + v2.y) / 2.0,
    (v1.z + v2.z) / 2.0
  );
};

ConvexDeltahedron.prototype.projectVertices = function (circumRadius = 1.0) {
  const self = this;

  const vertices = self.mesh.geometry.vertices;
  const projectedVertices = [];

  const verticesCount = vertices.length;
  for (let i = 0; i < verticesCount; i++) {
    const scalingFactor = circumRadius / vertices[i].length();
    projectedVertices.push(vertices[i].multiplyScalar(scalingFactor));
  }

  self.vertices = projectedVertices;
};

function PolyhedronFactory() {}

PolyhedronFactory.prototype.icosahedron = function (materialConfig = {}) {
  // Calculate the golden ratio.
  const p = (1.0 + Math.sqrt(5.0)) / 2.0;

  // A regular icosahedron can be generated via three orthogonal rectangles
  // where the side lengths of each rectangle conform to the golden ratio.
  const vertices = [
    // Rectangle 1
    new Vector3(0, p, -1), // 0
    new Vector3(0, p, 1), // 1
    new Vector3(0, -p, 1), // 2
    new Vector3(0, -p, -1), // 3
    // Rectangle 2
    new Vector3(-p, 1, 0), // 4
    new Vector3(p, 1, 0), // 5
    new Vector3(p, -1, 0), // 6
    new Vector3(-p, -1, 0), // 7
    // Rectangle 3
    new Vector3(-1, 0, -p), // 8
    new Vector3(-1, 0, p), // 9
    new Vector3(1, 0, p), // 10
    new Vector3(1, 0, -p), // 11
  ];

  const faces = [
    // Faces centered around vertex 0.
    new Face3(4, 1, 0),
    new Face3(8, 4, 0),
    new Face3(11, 8, 0),
    new Face3(5, 11, 0),
    new Face3(1, 5, 0),
    // Adjacent faces.
    new Face3(4, 9, 1),
    new Face3(8, 7, 4),
    new Face3(11, 3, 8),
    new Face3(5, 6, 11),
    new Face3(1, 10, 5),
    // Faces centered around vertex 2.
    new Face3(3, 6, 2),
    new Face3(7, 3, 2),
    new Face3(9, 7, 2),
    new Face3(10, 9, 2),
    new Face3(6, 10, 2),
    // Adjacent faces.
    new Face3(3, 11, 6),
    new Face3(7, 8, 3),
    new Face3(9, 4, 7),
    new Face3(10, 1, 9),
    new Face3(6, 5, 10),
  ];

  const material = new MeshBasicMaterial(materialConfig);
  const icosahedron = new ConvexDeltahedron(vertices, faces, material);

  return icosahedron;
};

function SphereFactory() {}

SphereFactory.prototype.sphere = function (
  sphereGeometry = [2, 64, 64],
  materialConfig = {}
) {
  const material = new MeshPhongMaterial(materialConfig);
  const sphere = new Sphere(sphereGeometry, material);

  const mesh = new Mesh(sphere, material);

  return mesh;
};

module.exports = {
  Polyhedron: Polyhedron,
  ConvexDeltahedron: ConvexDeltahedron,
  PolyhedronFactory: PolyhedronFactory,
};
