"use strict";

const assert = require("chai").assert;
const THREE = require("three");
const shapes = require("../shapes");

describe("Polyhedron", function () {
  before(function () {
    const vertices = [
      new THREE.Vector3(1, 1, 1),
      new THREE.Vector3(1, -1, -1),
      new THREE.Vector3(-1, 1, -1),
      new THREE.Vector3(-1, -1, 1),
    ];

    const faces = [
      new THREE.Face3(3, 0, 2),
      new THREE.Face3(3, 2, 1),
      new THREE.Face3(3, 1, 0),
      new THREE.Face3(0, 1, 2),
    ];

    this.polyhedron = new shapes.Polyhedron(vertices, faces, {});
  });

  it("should store mesh data", function () {
    assert.property(this.polyhedron, "mesh");
  });
  it("should store vertices", function () {
    assert.property(this.polyhedron.mesh.geometry, "vertices");
    assert.equal(4, this.polyhedron.mesh.geometry.vertices.length);
  });
  it("should store faces", function () {
    assert.property(this.polyhedron.mesh.geometry, "faces");
    assert.equal(4, this.polyhedron.mesh.geometry.faces.length);
  });
  describe("constructor", function () {
    it("should return a Polyhedron object", function () {
      assert.isTrue(this.polyhedron instanceof shapes.Polyhedron);
    });
  });
});
