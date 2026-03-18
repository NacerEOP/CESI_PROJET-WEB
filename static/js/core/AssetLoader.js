/**
 * AssetLoader.js
 * Utilities for loading textures, models, and other assets
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@r128/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@r128/examples/jsm/loaders/FBXLoader.js';

export class AssetLoader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
    this.fbxLoader = new FBXLoader();

    this.textures = new Map();
    this.models = new Map();
  }

  /**
   * Load a texture
   */
  async loadTexture(name, url) {
    try {
      const texture = await this.textureLoader.loadAsync(url);
      this.textures.set(name, texture);
      return texture;
    } catch (error) {
      console.error(`Failed to load texture: ${name}`, error);
      throw error;
    }
  }

  /**
   * Get a loaded texture
   */
  getTexture(name) {
    return this.textures.get(name);
  }

  /**
   * Load a GLTF/GLB model
   */
  async loadGLTF(name, url) {
    try {
      const gltf = await this.gltfLoader.loadAsync(url);
      this.models.set(name, gltf);
      return gltf;
    } catch (error) {
      console.error(`Failed to load GLTF model: ${name}`, error);
      throw error;
    }
  }

  /**
   * Load an FBX model
   */
  async loadFBX(name, url) {
    try {
      const model = await this.fbxLoader.loadAsync(url);
      this.models.set(name, model);
      return model;
    } catch (error) {
      console.error(`Failed to load FBX model: ${name}`, error);
      throw error;
    }
  }

  /**
   * Get a loaded model
   */
  getModel(name) {
    return this.models.get(name);
  }

  /**
   * Dispose all resources
   */
  dispose() {
    this.textures.forEach(texture => texture.dispose());
    this.textures.clear();
    this.models.clear();
  }
}
