/**
 * ThreeManager.js
 * Core Three.js application manager
 * Handles scene setup, rendering, and lifecycle
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class ThreeManager {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {
      dpr: options.dpr || window.devicePixelRatio,
      antialias: options.antialias !== false,
      alpha: options.alpha !== false,
      ...options
    };

    // Core Three.js objects
    this.scene = new THREE.Scene();
    this.camera = this._createCamera();
    this.renderer = this._createRenderer();

    // State management
    this.running = false;
    this.objects = [];
    this.effects = [];

    // Binding
    this._resize = this._resize.bind(this);
    this._frame = this._frame.bind(this);

    // Event listeners
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  _createCamera() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    camera.position.z = 5;
    return camera;
  }

  _createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.options.antialias,
      alpha: this.options.alpha
    });

    renderer.setPixelRatio(this.options.dpr);
    renderer.setSize(
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      false
    );

    return renderer;
  }

  /**
   * Add an object (mesh, group, etc) to the scene
   */
  addObject(object) {
    if (object.object3D) {
      this.scene.add(object.object3D);
    } else if (object instanceof THREE.Object3D) {
      this.scene.add(object);
    } else {
      throw new Error('Invalid object: must have object3D property or be a THREE.Object3D');
    }
    this.objects.push(object);
    return object;
  }

  /**
   * Remove an object from the scene
   */
  removeObject(object) {
    const obj = object.object3D || object;
    this.scene.remove(obj);
    this.objects = this.objects.filter(o => o !== object);
  }

  /**
   * Add an effect/updatable to the render loop
   */
  addEffect(effect) {
    if (!effect.update) {
      throw new Error('Effect must have an update() method');
    }
    this.effects.push(effect);
    return effect;
  }

  /**
   * Remove an effect
   */
  removeEffect(effect) {
    this.effects = this.effects.filter(e => e !== effect);
  }

  /**
   * Start the render loop
   */
  start() {
    if (this.running) return;
    this.running = true;
    this._frame(0);
  }

  /**
   * Stop the render loop
   */
  stop() {
    this.running = false;
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.running = false;
    window.removeEventListener('resize', this._resize);

    this.objects.forEach(obj => {
      if (obj.dispose) obj.dispose();
    });

    this.renderer.dispose();
  }

  _resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }

  _frame(time) {
    if (!this.running) return;

    // Update all effects
    for (const effect of this.effects) {
      if (effect.update) {
        effect.update(time, this);
      }
    }

    // Update all objects
    for (const obj of this.objects) {
      if (obj.update) {
        obj.update(time, this);
      }
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._frame);
  }

  /**
   * Get scene, camera, or renderer
   */
  getContext() {
    return {
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      canvas: this.canvas
    };
  }
}
