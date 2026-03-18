/**
 * effects/EffectTemplate.js
 * Template for creating custom effects
 * 
 * How to use:
 * 1. Copy this file and rename it (e.g., MyCustomEffect.js)
 * 2. Rename the class and customize init() and update()
 * 3. Import in scenes/ file and add with await manager.addObject(new MyCustomEffect())
 * 4. Reference GeometryFactory, MaterialFactory, and LightFactory in models/
 */

import { BaseObject } from '../core/BaseObject.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

export class EffectTemplate extends BaseObject {
  constructor(name = 'CustomEffect', options = {}) {
    super(name);

    // Store any configuration options
    this.options = options;

    // Initialize your properties here
    this.mesh = null;
  }

  /**
   * Called once during initialization
   * Load assets, create geometries, materials, etc.
   */
  async init(context) {
    // context contains: { scene, camera, renderer, canvas }
    
    // Example: Create a simple cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geometry, material);
    
    this.addChild(this.mesh);
    
    this.isInitialized = true;
  }

  /**
   * Called every frame
   * Update animations, physics, etc.
   */
  update(time, manager) {
    super.update(time, manager);

    // Example: Rotate the mesh
    if (this.mesh) {
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y += 0.015;
    }
  }

  /**
   * Optional: Clean up resources
   */
  dispose() {
    super.dispose();
  }
}
