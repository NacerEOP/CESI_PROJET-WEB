/**
 * effects/RotatingGeometry.js
 * Rotating 3D geometry effect
 * Demonstrates basic object manipulation with rotation
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';
import { BaseObject } from '../core/BaseObject.js';

export class RotatingGeometry extends BaseObject {
  constructor(name = 'RotatingGeometry', options = {}) {
    super(name);

    this.geometry = options.geometry || new THREE.BoxGeometry(1, 1, 1);
    this.material = options.material || new THREE.MeshPhongMaterial({
      color: options.color || 0x00ff00
    });

    this.rotationSpeed = options.rotationSpeed || { x: 0.01, y: 0.015, z: 0 };
    this.scale = options.scale || 1;

    this.mesh = null;
  }

  async init(context) {
    const { scene } = context;

    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(this.scale, this.scale, this.scale);
    this.addChild(this.mesh);

    // Add lights if not already in scene
    if (!scene.getObjectByName('defaultLight')) {
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.name = 'defaultLight';
      light.position.set(5, 5, 5);
      scene.add(light);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
    }

    this.isInitialized = true;
  }

  update(time, manager) {
    super.update(time, manager);

    if (this.mesh) {
      this.mesh.rotation.x += this.rotationSpeed.x;
      this.mesh.rotation.y += this.rotationSpeed.y;
      this.mesh.rotation.z += this.rotationSpeed.z;
    }
  }

  /**
   * Change the color of the object
   */
  setColor(hex) {
    if (this.mesh && this.mesh.material) {
      this.mesh.material.color.setHex(hex);
    }
  }

  /**
   * Change rotation speed
   */
  setRotationSpeed(x, y, z) {
    this.rotationSpeed = { x, y, z };
  }

  dispose() {
    super.dispose();
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
  }
}
