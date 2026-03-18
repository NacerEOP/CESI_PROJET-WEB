/**
 * inline-models.js
 *
 * Simple utility to embed GLTF/GLB models inline inside any page element.
 *
 * Usage:
 * 1) Add an element to your HTML:
 *    <div class="inline-3d" data-inline-model data-model="static/assets/3dModels/Test-CUBE.glb" style="width:300px;height:300px"></div>
 *
 * 2) Include this script (it will auto-init on DOMContentLoaded):
 *    <script type="module" src="static/js/inline-models.js"></script>
 *
 * Data attributes (all optional):
 *  - data-model: URL to the GLTF/GLB model (default: static/assets/3dModels/Test-CUBE.glb)
 *  - data-scale: numeric scale factor (default: 1)
 *  - data-rotation: comma-separated Euler angles in radians (default: 0,0,0)
 *  - data-position: comma-separated position offset (default: 0,0,0)
 *  - data-light: "false" to disable default lighting (default: true)
 *
 * The element is treated like a tabletop; camera pitch & yaw adjust as the element scrolls into view.
 */

import { ThreeManager } from './core/ThreeManager.js';
import { AssetLoader } from './managers/AssetLoader.js';
import { LightFactory } from './models/LightFactory.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const DEFAULT_MODEL = 'static/assets/3dModels/Test-CUBE.glb';

function parseVector(attr, defaultValue) {
  if (!attr) return defaultValue;
  const parts = attr.split(',').map((v) => parseFloat(v.trim()));
  if (parts.some((v) => Number.isNaN(v))) return defaultValue;
  return parts.length === 1 ? [parts[0], 0, 0] : [parts[0], parts[1] ?? 0, parts[2] ?? 0];
}

function resolveUrl(path, prefix = '') {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path)) return path;
  
  // Remove leading slashes
  const clean = path.replace(/^\/+/, '');
  
  // Handle base prefix
  if (prefix) {
    const cleanPrefix = prefix.replace(/\/+$/, ''); // remove trailing slashes
    if (!cleanPrefix) return '/' + clean;
    return `${cleanPrefix}/${clean}`;
  }
  
  // No prefix, ensure leading slash
  if (!clean.startsWith('/')) return '/' + clean;
  return clean;
}

export class InlineModel {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.canvas = null;
    this.manager = null;
    this.loader = new AssetLoader();
    this.model = null;
    this._raf = null;
    this._needsUpdate = true;
    this._baseDistance = null;

    this._onScroll = this._onScroll.bind(this);
    this._onResize = this._onResize.bind(this);
    this._update = this._update.bind(this);
  }

  async init() {
    console.log('InlineModel.init() called for:', this.container);
    this._setupCanvas();
    console.log('Canvas set up:', this.canvas);
    
    this.manager = new ThreeManager(this.canvas, { alpha: true, antialias: true });
    console.log('ThreeManager created');

    // Ensure the renderer matches the current container size
    this._resizeCanvas();
    console.log('Canvas resized');

    // Keep the scene transparent so HTML can show through
    this.manager.renderer.setClearColor(0x000000, 0);

    // Add lights unless explicitly disabled
    const disableLights = this._getBoolAttr('light', false);
    if (!disableLights) {
      const lights = LightFactory.createDefaultLighting();
      Object.values(lights).forEach((light) => this.manager.addObject(light));
      console.log('Lights added');
    }

    await this._loadModel();
    console.log('Model loaded');
    
    this.manager.start();
    console.log('Render loop started');

    console.debug('InlineModel: initialized', {
      container: this.container,
      modelUrl: this.container.dataset.model || DEFAULT_MODEL
    });

    this._registerListeners();
    this._update();
  }

  _setupCanvas() {
    const isCanvas = this.container.tagName === 'CANVAS';

    if (isCanvas) {
      this.canvas = this.container;
    } else {
      const style = window.getComputedStyle(this.container);
      if (style.position === 'static') {
        this.container.style.position = 'relative';
      }

      this.canvas = document.createElement('canvas');
      this.canvas.classList.add('inline-3d-canvas');
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.display = 'block';
      this.canvas.style.pointerEvents = 'none';
      this.container.appendChild(this.canvas);
    }

    // Ensure the canvas is sized to the container
    this._resizeCanvas();
  }

  async _loadModel() {
    const baseEl = document.querySelector('base');
    const prefix = baseEl ? baseEl.getAttribute('href') || '' : '';

    const modelUrl =
      this.options.modelUrl ||
      this.container.dataset.model ||
      this.container.dataset.src ||
      DEFAULT_MODEL;

    const url = resolveUrl(modelUrl, prefix);
    const cacheKey = url;

    console.log('InlineModel: loading model', {
      modelUrl,
      baseHref: baseEl ? baseEl.getAttribute('href') : 'none',
      prefix,
      resolvedUrl: url
    });

    let scene;

    try {
      // Load and clone into this instance
      await this.loader.loadGLTF(cacheKey, url);
      const gltf = this.loader.getModel(cacheKey);
      if (!gltf) {
        throw new Error(`Failed to load model (empty result): ${url}`);
      }

      const source = gltf.scene || gltf;
      scene = source.clone(true);
      console.log('InlineModel: model loaded successfully', { url, gltf });
    } catch (error) {
      console.error('InlineModel: failed to load model, falling back to a cube.', error);

      // Fallback: create a simple cube so user sees something
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({ color: 0x8888ff, flatShading: true });
      scene = new THREE.Mesh(geometry, material);
    }

    const scale = parseFloat(this.container.dataset.scale) || 1;
    const rotation = parseVector(this.container.dataset.rotation, [0, 0, 0]);
    const position = parseVector(this.container.dataset.position, [0, 0, 0]);

    scene.scale.set(scale, scale, scale);
    scene.rotation.set(rotation[0], rotation[1], rotation[2]);
    scene.position.set(position[0], position[1], position[2]);

    // Center model at world origin
    this._centerObject(scene);

    // Add to scene
    this.manager.addObject(scene);
    this.model = scene;
  }

  _centerObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    if (!box.isEmpty()) {
      const center = new THREE.Vector3();
      box.getCenter(center);
      object.position.sub(center);

      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      let radius = sphere.radius;

      // Ensure we have a reasonable minimum size
      if (!Number.isFinite(radius) || radius <= 0.001) {
        radius = 1;
      }

      // Place camera so model fits nicely
      const fov = this.manager.camera.fov * (Math.PI / 180);
      const distance = Math.abs(radius / Math.sin(fov / 2)) * 1.2;
      this.manager.camera.position.set(0, radius * 0.7, distance);
      this._baseDistance = distance;
      this.manager.camera.lookAt(0, 0, 0);
    }
  }

  _getBoolAttr(name, defaultValue) {
    const attr = this.container.dataset[name];
    if (attr === undefined) return defaultValue;
    return attr.toLowerCase() !== 'false';
  }

  _resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(rect.width * window.devicePixelRatio));
    this.canvas.height = Math.max(1, Math.floor(rect.height * window.devicePixelRatio));

    // Update the ThreeManager renderer/camera config if needed
    if (this.manager) {
      // Use the public resize if available
      if (typeof this.manager._resize === 'function') {
        this.manager._resize();
      } else if (this.manager.renderer && this.manager.camera) {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.manager.camera.aspect = width / height;
        this.manager.camera.updateProjectionMatrix();
        this.manager.renderer.setSize(width, height, false);
      }
    }
  }

  _registerListeners() {
    window.addEventListener('scroll', this._onScroll, { passive: true });
    window.addEventListener('resize', this._onResize);
  }

  _onScroll() {
    this._needsUpdate = true;
    if (!this._raf) {
      this._raf = requestAnimationFrame(this._update);
    }
  }

  _onResize() {
    this._needsUpdate = true;
    this._resizeCanvas();
    if (!this._raf) {
      this._raf = requestAnimationFrame(this._update);
    }
  }

  _update() {
    this._raf = null;
    if (!this.manager || !this.model) return;

    const rect = this.container.getBoundingClientRect();
    const vh = window.innerHeight;

    // Progress where 0 == top of viewport, 1 == bottom of viewport
    const progress = Math.min(1, Math.max(0, (rect.top + rect.height / 2) / vh));

    // Map progress to camera pitch and yaw (table / overhead look)
    const pitchMin = 0.3; // more overhead
    const pitchMax = 0.7; // more angled
    const pitch = THREE.MathUtils.lerp(pitchMin, pitchMax, progress);
    const yaw = THREE.MathUtils.lerp(-0.25, 0.25, (rect.left + rect.width / 2) / window.innerWidth);

    this.manager.camera.rotation.set(pitch, yaw, 0);
    this.manager.camera.lookAt(0, 0, 0);

    // Slight camera distance shift to emphasize perspective during scroll
    if (this._baseDistance) {
      const distOffset = THREE.MathUtils.lerp(-0.4, 0.4, progress - 0.5);
      this.manager.camera.position.set(0, this.manager.camera.position.y, this._baseDistance + distOffset);
    }
  }

  dispose() {
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._onResize);
    if (this.manager) {
      this.manager.dispose();
      this.manager = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }
  }
}

export async function initInlineModels(options = {}) {
  const selector = options.selector || '[data-inline-model]';
  const nodes = Array.from(document.querySelectorAll(selector));
  console.log(`InlineModel: found ${nodes.length} element(s) with selector "${selector}"`, nodes);
  const instances = nodes.map((node) => new InlineModel(node, options));
  try {
    await Promise.all(instances.map((inst) => inst.init()));
    console.log('✅ InlineModel: all instances initialized');
    return instances;
  } catch (error) {
    console.error('❌ InlineModel: initialization failed', error);
    throw error;
  }
}

// Auto-init by default
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('InlineModel: DOMContentLoaded event fired, initializing...');
    initInlineModels().catch(err => console.error('InlineModel init error:', err));
  });
} else {
  console.log('InlineModel: document already loaded, initializing...');
  initInlineModels().catch(err => console.error('InlineModel init error:', err));
}
