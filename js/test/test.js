'use strict';

let assert = require('chai').assert;
let THREE = require('three');
let pf = require('../shapes');

describe('Polyhedron', function() {
  before(function() {
    const vertices = [
      new THREE.Vector3( 1,  1,  1),
      new THREE.Vector3( 1, -1, -1),
      new THREE.Vector3(-1,  1, -1),
      new THREE.Vector3(-1, -1,  1),
    ];

    const faces = [
      new THREE.Face3(3, 0, 2),
      new THREE.Face3(3, 2, 1),
      new THREE.Face3(3, 1, 0),
      new THREE.Face3(0, 1, 2),
    ];

    this.polyhedron = new pf.Polyhedron(vertices, faces, {});
  });

  it('should store mesh data', function() {
    assert.property(this.polyhedron, 'mesh');
  });
  it('should store vertices', function() {
    assert.property(this.polyhedron.mesh.geometry, 'vertices');
    assert.equal(4, this.polyhedron.mesh.geometry.vertices.length);
  });
  it('should store faces', function() {
    assert.property(this.polyhedron.mesh.geometry, 'faces');
    assert.equal(4, this.polyhedron.mesh.geometry.faces.length);
  });
  describe('constructor', function() {
    it('should return a Polyhedron object', function() {
      assert.isTrue(this.polyhedron instanceof pf.Polyhedron);
    });
  });
});

describe('ConvexDeltahedron', function() {
  before(function() {
    const vertices = [
      new THREE.Vector3( 1,  1,  1),
      new THREE.Vector3( 1, -1, -1),
      new THREE.Vector3(-1,  1, -1),
      new THREE.Vector3(-1, -1,  1),
    ];

    const faces = [
      new THREE.Face3(3, 0, 2),
      new THREE.Face3(3, 2, 1),
      new THREE.Face3(3, 1, 0),
      new THREE.Face3(0, 1, 2),
    ];

    const material = new THREE.MeshBasicMaterial({});

    this.polyhedron = new pf.ConvexDeltahedron(vertices, faces, material);
  });

  it('should contain faces all made of equilateral triangles', function() {
    const vertices = this.polyhedron.mesh.geometry.vertices;
    const faces = this.polyhedron.mesh.geometry.faces;

    const facesCount = this.polyhedron.mesh.geometry.faces;
    for(let i = 0; i < facesCount; i++) {
      const a = vertices[faces[i].a];
      const b = vertices[faces[i].b];
      const c = vertices[faces[i].c];

      const ab = a.distanceTo(b);
      const bc = b.distanceTo(c);
      const ca = c.distanceTo(a);

      assert.equal(ab, bc);
      assert.equal(ab, ca);
    }
  });
  it('should have a function to subdivide existing faces', function() {
    assert.property(this.polyhedron, 'refine');
  });
  it('should have a function to calculate the midpoint of an edge', function() {
    assert.property(this.polyhedron, 'getMidpoint');
  });
  it('should have a function to add a midpoint to an edge', function() {
    assert.property(this.polyhedron, 'addMidpoint');
  });
  describe('refine', function() {
    it('should perform a 2-frequency subdivision on each face', function() {

    });
  });
});