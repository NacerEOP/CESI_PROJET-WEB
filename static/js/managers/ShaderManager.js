/**
 * managers/ShaderManager.js
 * Manages custom shader materials and WebGL shader integration
 * Facilitates mixing Three.js materials with custom shaders
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

export class ShaderManager {
  constructor() {
    this.shaders = new Map();
    this.materials = new Map();
  }

  /**
   * Load a vertex and fragment shader from URLs
   */
  async loadShader(name, vertexUrl, fragmentUrl) {
    try {
      const [vertexSource, fragmentSource] = await Promise.all([
        fetch(vertexUrl).then(r => r.text()),
        fetch(fragmentUrl).then(r => r.text())
      ]);

      this.shaders.set(name, {
        vertex: vertexSource,
        fragment: fragmentSource
      });

      return { vertex: vertexSource, fragment: fragmentSource };
    } catch (error) {
      console.error(`Failed to load shader: ${name}`, error);
      throw error;
    }
  }

  /**
   * Create a ShaderMaterial from loaded shaders
   */
  createShaderMaterial(name, shaderName, uniforms = {}, options = {}) {
    const shader = this.shaders.get(shaderName);
    if (!shader) {
      throw new Error(`Shader not found: ${shaderName}`);
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: shader.vertex,
      fragmentShader: shader.fragment,
      uniforms: uniforms,
      side: options.side || THREE.DoubleSide,
      wireframe: options.wireframe || false,
      transparent: options.transparent !== false,
      ...options
    });

    this.materials.set(name, material);
    return material;
  }

  /**
   * Get a material
   */
  getMaterial(name) {
    return this.materials.get(name);
  }

  /**
   * Update material uniforms
   */
  updateUniforms(materialName, uniformUpdates) {
    const material = this.materials.get(materialName);
    if (!material) {
      throw new Error(`Material not found: ${materialName}`);
    }

    Object.entries(uniformUpdates).forEach(([key, value]) => {
      if (material.uniforms[key]) {
        material.uniforms[key].value = value;
      }
    });
  }

  /**
   * Dispose all materials
   */
  dispose() {
    this.materials.forEach(material => material.dispose());
    this.materials.clear();
    this.shaders.clear();
  }
}
