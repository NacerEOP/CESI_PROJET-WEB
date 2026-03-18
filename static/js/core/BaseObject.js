/**
 * BaseObject.js
 * Base class for all 3D objects (meshes, groups, visual elements)
 * Provides common lifecycle methods and utilities
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class BaseObject {
  constructor(name = 'BaseObject') {
    this.name = name;
    this.object3D = new THREE.Group();
    this.object3D.name = name;

    this.isInitialized = false;
    this.isVisible = true;

    // For animation/update tracking
    this._time = 0;
  }

  /**
   * Initialize the object (async to allow resource loading)
   * Override in subclasses
   */
  async init(context) {
    this.isInitialized = true;
  }

  /**
   * Update method called each frame
   * @param {number} time - Current time in milliseconds
   * @param {ThreeManager} manager - Reference to ThreeManager
   */
  update(time, manager) {
    this._time = time;
  }

  /**
   * Set visibility
   */
  setVisible(visible) {
    this.isVisible = visible;
    this.object3D.visible = visible;
  }

  /**
   * Dispose of resources (geometries, materials, textures, etc)
   */
  dispose() {
    // Recursively dispose geometries and materials
    this.object3D.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  /**
   * Add a child object
   */
  addChild(object3D) {
    this.object3D.add(object3D);
  }

  /**
   * Remove a child object
   */
  removeChild(object3D) {
    this.object3D.remove(object3D);
  }

  /**
   * Get position
   */
  getPosition() {
    return this.object3D.position;
  }

  /**
   * Set position
   */
  setPosition(x, y, z) {
    this.object3D.position.set(x, y, z);
  }

  /**
   * Get rotation (euler)
   */
  getRotation() {
    return this.object3D.rotation;
  }

  /**
   * Set rotation (euler)
   */
  setRotation(x, y, z) {
    this.object3D.rotation.set(x, y, z);
  }

  /**
   * Get scale
   */
  getScale() {
    return this.object3D.scale;
  }

  /**
   * Set scale
   */
  setScale(x, y = x, z = x) {
    this.object3D.scale.set(x, y, z);
  }
}
