'use strict';

let assert = require('chai').assert;
let THREE = require('three');
let shapes = require('../shapes');

describe('ConvexDeltahedron', function() {
  beforeEach(function() {
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

    this.polyhedron = new shapes.ConvexDeltahedron(vertices, faces, material);
  });

  it('should contain faces all made of equilateral triangles', function() {
    let vertices = this.polyhedron.mesh.geometry.vertices;
    let faces = this.polyhedron.mesh.geometry.faces;

    const facesCount = this.polyhedron.mesh.geometry.faces;
    for(let i = 0; i < facesCount; i++) {
      let a = vertices[faces[i].a];
      let b = vertices[faces[i].b];
      let c = vertices[faces[i].c];

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
    it('should perform a class I 2-frequency subdivision on each face', 
      function() {
        // See https://en.wikibooks.org/wiki/Geodesic_Grids/Breakdown_structures
        const preFacesCount = this.polyhedron.mesh.geometry.faces.length;

        this.polyhedron.refine();

        const postFacesCount = this.polyhedron.mesh.geometry.faces.length;

        assert.equal(postFacesCount, preFacesCount * 4);
      }
    );
  });
  describe('subdivideFace', function() {
    it('should return the subdivided faces from a class I 2-frequency ' +
      'subdivision on a single face',
      function() {
        let resultingFaces = this.polyhedron.subdivideFace(
          this.polyhedron.mesh.geometry.faces[0]
        );

        assert.equal(4, resultingFaces.length);
      }
    );
  });
  describe('addMidpoint', function() {
    it('should add a new vertex to the mesh at the midpoint of an edge',
      function() {
        let vertices = this.polyhedron.mesh.geometry.vertices;
        let face = this.polyhedron.mesh.geometry.faces[0];
        let v1 = vertices[face.a];
        let v2 = vertices[face.b];

        const preVertexCount = vertices.length;
        
        this.polyhedron.addMidpoint(v1, v2);

        assert.equal(preVertexCount + 1,
          this.polyhedron.mesh.geometry.vertices.length);
      }
    );
  });
  describe('getMidpoint', function() {
    it('should return a vertex representing the midpoint of an edge',
      function() {
        let v1 = new THREE.Vector3(0, 0, 0);
        let v2 = new THREE.Vector3(1, 1, 1);

        let midpoint = this.polyhedron.getMidpoint(v1, v2);

        assert.equal(0.5, midpoint.x);
        assert.equal(0.5, midpoint.y);
        assert.equal(0.5, midpoint.z);
      }
    );
    it('should be commutative', function() {
      let v1 = new THREE.Vector3(0, 0, 0);
      let v2 = new THREE.Vector3(1, 1, 1);

      let midpoint1 = this.polyhedron.getMidpoint(v1, v2);
      let midpoint2 = this.polyhedron.getMidpoint(v2, v1);

      assert.equal(midpoint1.x, midpoint2.x);
      assert.equal(midpoint1.y, midpoint2.y);
      assert.equal(midpoint1.z, midpoint2.z);
    });
  });
  describe('projectVertices', function() {
    it('should project each vertex onto a circumscribed sphere of the given ' +
      'radius',
      function() {
        const radius = 2.0;

        this.polyhedron.projectVertices(radius);

        let vertices = this.polyhedron.mesh.geometry.vertices.length;

        const verticesCount = vertices.length;
        for(let i = 0; i < verticesCount; i++) {
          assert.equal(radius, vertices[i].length());
        }
      })
  });
});
