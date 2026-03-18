/**
 * scenes/DashboardScene.js
 * Scene configuration for dashboard/profile page
 * Manages user-specific 3D visualizations
 */

import { RotatingGeometry } from '../effects/RotatingGeometry.js';
import { GeometryFactory } from '../models/GeometryFactory.js';
import { MaterialFactory } from '../models/MaterialFactory.js';

export class DashboardScene {
  constructor(manager) {
    this.manager = manager;
    this.objects = [];
  }

  /**
   * Initialize the dashboard scene
   */
  async init() {
    try {
      // Create main dashboard visualization
      const dashboard = new RotatingGeometry('DashboardMain', {
        geometry: GeometryFactory.createCone(1, 2, 8),
        material: MaterialFactory.createStandardMaterial({
          color: 0xffaa00,
          metalness: 0.7,
          roughness: 0.2
        }),
        rotationSpeed: { x: 0.005, y: 0.02, z: 0 },
        scale: 1.5
      });
      await this.manager.addObject(dashboard);
      this.objects.push(dashboard);

      console.log('✅ Dashboard scene initialized');
    } catch (error) {
      console.error('Failed to initialize dashboard scene:', error);
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
