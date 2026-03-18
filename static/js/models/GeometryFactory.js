/**
 * models/GeometryFactory.js
 * Factory for creating commonly used geometries
 * Centralizes geometry creation for consistency and reuse
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

export class GeometryFactory {
  static createBox(width = 1, height = 1, depth = 1) {
    return new THREE.BoxGeometry(width, height, depth);
  }

  static createSphere(radius = 1, widthSegments = 32, heightSegments = 32) {
    return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  }

  static createCone(radius = 1, height = 1, segments = 32) {
    return new THREE.ConeGeometry(radius, height, segments);
  }

  static createCylinder(radiusTop = 1, radiusBottom = 1, height = 1, segments = 32) {
    return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
  }

  static createPlane(width = 1, height = 1) {
    return new THREE.PlaneGeometry(width, height);
  }

  static createTorus(radius = 1, tubeRadius = 0.4, segments = 64, tubeSegments = 8) {
    return new THREE.TorusGeometry(radius, tubeRadius, segments, tubeSegments);
  }

  static createIcosahedron(radius = 1, detail = 0) {
    return new THREE.IcosahedronGeometry(radius, detail);
  }
}
