'use strict';

let assert = require('chai').assert;
let THREE = require('three');
let pf = require('../shapes');

describe('PolyhedronFactory', function() {
  before(function() {
    this.factory = new pf.PolyhedronFactory();
  });

  describe('icosahedron', function() {
    it('should generate an icosahedron', function() {
      let polyhedron = this.factory.icosahedron();

      const verticesCount = polyhedron.mesh.geometry.vertices.length;
      const facesCount = polyhedron.mesh.geometry.faces.length;
      const edgesCount = verticesCount + facesCount - 2;

      assert.equal(12, verticesCount);
      assert.equal(20, facesCount);
      assert.equal(30, edgesCount);
    });
  });
});