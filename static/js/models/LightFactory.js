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

  /**
   * Create surface/rim lighting with multiple point lights arranged around the model
   * @param {number} modelRadius - Approximate radius of the model
   * @param {number} lightCount - Number of lights to arrange around the model (default: 6)
   * @param {number} lightIntensity - Intensity of each rim light (default: 0.6)
   * @param {number} lightDistance - Distance of each light from model center (default: 1.5x radius)
   * @param {number} lightHeight - Height offset of lights above model center (default: 0.3x radius)
   * @returns {Object} Object containing ambient base light and array of rim lights
   */
  static createSurfaceLighting(modelRadius = 1, lightCount = 6, lightIntensity = 0.6, lightDistance = null, lightHeight = null) {
    const distance = lightDistance ?? modelRadius * 1.5;
    const height = lightHeight ?? modelRadius * 0.3;
    
    const lights = {};
    const rimLights = [];
    
    // Base ambient light for overall illumination
    lights.ambient = this.createAmbientLight(0.7, 0xffffff);
    
    // Arrange point lights in a circle around the model
    for (let i = 0; i < lightCount; i++) {
      const angle = (i / lightCount) * Math.PI * 2;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = height;
      
      const light = new THREE.PointLight(0xffffff, lightIntensity, distance * 3);
      light.position.set(x, y, z);
      rimLights.push(light);
    }
    
    lights.rims = rimLights;
    
    // Optional key light from above for definition
    lights.key = this.createDirectionalLight(0.5, 0xffffff);
    lights.key.position.set(0, distance * 1.2, distance * 0.5);
    
    return lights;
  }
}
