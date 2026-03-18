/**
 * models/LightFactory.js
 * Factory for creating standard lighting setups
 * Provides common light configurations
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class LightFactory {
  static createDirectionalLight(intensity = 1, color = 0xffffff) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 5, 5);
    return light;
  }

  static createAmbientLight(intensity = 0.5, color = 0xffffff) {
    return new THREE.AmbientLight(color, intensity);
  }

  static createPointLight(intensity = 1, color = 0xffffff, distance = 100) {
    const light = new THREE.PointLight(color, intensity, distance);
    light.position.set(0, 10, 0);
    return light;
  }

  static createSpotLight(intensity = 1, color = 0xffffff, angle = Math.PI / 6) {
    const light = new THREE.SpotLight(color, intensity, 100, angle);
    light.position.set(10, 20, 10);
    return light;
  }

  /**
   * Create default 3-point lighting setup
   */
  static createDefaultLighting() {
    return {
      key: this.createDirectionalLight(0.8),      // Main light
      fill: this.createDirectionalLight(0.4),    // Fill light
      ambient: this.createAmbientLight(0.6)      // Ambient light
    };
  }
}
