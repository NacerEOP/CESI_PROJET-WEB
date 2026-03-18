/**
 * scenes/BrowseScene.js
 * Scene configuration for browse/catalog page
 * Manages 3D objects and effects for browsing internships
 */

import { ParticleSystem } from '../effects/ParticleSystem.js';
import { RotatingGeometry } from '../effects/RotatingGeometry.js';

export class BrowseScene {
  constructor(manager) {
    this.manager = manager;
    this.objects = [];
  }

  /**
   * Initialize the browse scene
   */
  async init() {
    try {
      // Create particle system as main visual effect
      const particles = new ParticleSystem('BrowseParticles', {
        particleCount: 1000,
        emissionRate: 50,
        lifetime: 3000,
        speed: 2
      });
      await this.manager.addObject(particles);
      this.objects.push(particles);

      // Create subtle background element
      const background = new RotatingGeometry('BrowseBackground', {
        color: 0x0088ff,
        rotationSpeed: { x: 0.002, y: 0.005, z: 0.001 },
        scale: 2
      });
      background.setPosition(0, 0, -5);
      background.setVisible(true);
      await this.manager.addObject(background);
      this.objects.push(background);

      console.log('✅ Browse scene initialized');
    } catch (error) {
      console.error('Failed to initialize browse scene:', error);
      throw error;
    }
  }

  /**
   * Clean up scene
   */
  dispose() {
    this.objects.forEach(obj => {
      this.manager.removeObject(obj);
      if (obj.dispose) obj.dispose();
    });
    this.objects = [];
  }

  /**
   * Get all scene objects
   */
  getObjects() {
    return this.objects;
  }
}
