/**
 * scenes/HomeScene.js
 * Scene configuration for home page
 * Manages all 3D objects and effects for the home page
 */

import { RotatingGeometry } from '../effects/RotatingGeometry.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { GeometryFactory } from '../models/GeometryFactory.js';
import { MaterialFactory } from '../models/MaterialFactory.js';

export class HomeScene {
  constructor(manager) {
    this.manager = manager;
    this.objects = [];
  }

  /**
   * Initialize the home scene
   */
  async init() {
    try {
      // Create main hero rotating cube
      const cube = new RotatingGeometry('HeroCube', {
        geometry: GeometryFactory.createBox(2, 2, 2),
        material: MaterialFactory.createPhongMaterial({ color: 0x00ff88 }),
        rotationSpeed: { x: 0.01, y: 0.015, z: 0 },
        scale: 1
      });
      await this.manager.addObject(cube);
      this.objects.push(cube);

      // Create secondary rotating geometry
      const pyramid = new RotatingGeometry('HeroPyramid', {
        geometry: GeometryFactory.createCone(1, 2, 4),
        material: MaterialFactory.createPhongMaterial({ color: 0xff0088 }),
        rotationSpeed: { x: 0.02, y: 0.01, z: 0.005 },
        scale: 0.8
      });
      pyramid.setPosition(-3, 0, 0);
      await this.manager.addObject(pyramid);
      this.objects.push(pyramid);

      // Add particle effect
      const particles = new ParticleSystem('HomeParticles', {
        particleCount: 500,
        emissionRate: 20,
        lifetime: 2000,
        speed: 2
      });
      await this.manager.addObject(particles);
      this.objects.push(particles);

      console.log('✅ Home scene initialized');
    } catch (error) {
      console.error('Failed to initialize home scene:', error);
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
