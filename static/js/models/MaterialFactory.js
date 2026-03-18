/**
 * models/MaterialFactory.js
 * Factory for creating commonly used materials
 * Centralizes material creation for consistency
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class MaterialFactory {
  static createPhongMaterial(options = {}) {
    return new THREE.MeshPhongMaterial({
      color: options.color || 0xffffff,
      shininess: options.shininess || 100,
      ...options
    });
  }

  static createStandardMaterial(options = {}) {
    return new THREE.MeshStandardMaterial({
      color: options.color || 0xffffff,
      metalness: options.metalness || 0.5,
      roughness: options.roughness || 0.5,
      ...options
    });
  }

  static createBasicMaterial(options = {}) {
    return new THREE.MeshBasicMaterial({
      color: options.color || 0xffffff,
      ...options
    });
  }

  static createPointMaterial(options = {}) {
    return new THREE.PointsMaterial({
      size: options.size || 2,
      color: options.color || 0xffffff,
      vertexColors: options.vertexColors || false,
      transparent: options.transparent !== false,
      ...options
    });
  }

  static createLineMaterial(options = {}) {
    return new THREE.LineBasicMaterial({
      color: options.color || 0xffffff,
      linewidth: options.linewidth || 1,
      ...options
    });
  }
}
