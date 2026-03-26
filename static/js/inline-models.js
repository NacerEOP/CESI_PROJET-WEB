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
    this._setupCanvas();
    this.manager = new ThreeManager(this.canvas, { alpha: true, antialias: true });

    // Ensure the renderer matches the current container size
    this._resizeCanvas();

    // Keep the scene transparent so HTML can show through
    this.manager.renderer.setClearColor(0x000000, 0);

    // Add lights unless explicitly disabled
    const disableLights = this._getBoolAttr('light', false);
    if (!disableLights) {
      const lights = LightFactory.createDefaultLighting();
      Object.values(lights).forEach((light) => this.manager.addObject(light));
    }

    await this._loadModel();
    this.manager.start();

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
      
      // Position camera above the model for top-down view
      this.manager.camera.position.set(0, distance, 0);
      this.manager.camera.lookAt(0, 0, 0);
      
      this._baseDistance = distance;
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

    // Keep camera straight down over model, move in X axis with model to keep it directly beneath.
    const baseY = this._baseDistance || 5;
    const cameraY = baseY + 2.5;                // fixed altitude above model
    const cameraX = THREE.MathUtils.lerp(-2, 2, progress); // horizontal motion
    
    // Z offset based on model's horizontal position relative to viewport center
    const vpCenterX = window.innerWidth / 2;
const normalized = (rect.left + rect.width / 2) / window.innerWidth;
const modelCenterX = (normalized - 0.5) * 2;
    const distFromCenter = modelCenterX  ;
    const cameraZ = -distFromCenter ;  // scale factor for Z offset
    
    this.manager.camera.position.set(-cameraY, cameraX, cameraZ);
    this.manager.camera.lookAt(cameraX, 0, 0);  // always straight down onto model

    

    // ensure render if manager supports it
    if (this.manager.renderer && this.manager.camera) {
      this.manager.renderer.render(this.manager.scene, this.manager.camera);
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
  const instances = nodes.map((node) => new InlineModel(node, options));
  await Promise.all(instances.map((inst) => inst.init()));
  return instances;
}

// Auto-init by default
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initInlineModels());
} else {
  initInlineModels();
}
