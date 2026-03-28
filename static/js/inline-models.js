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
 *  - data-light: "false" to disable dynamic lighting (default: true)
 *  - data-camera-y: camera Y height offset from model (default: adaptive based on model size)
 *  - data-scroll-speed: camera movement speed multiplier on scroll (default: 1.0)
 *  - data-fov: camera field of view in degrees (default: 110)
 *  - data-output-zoom: scale rendered output in div (default: 1.0, e.g. 1.2 for 20% zoom-in)
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
    this._modelRadius = null;
    this._customCameraY = null;
    this._baseQuaternion = null;

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
      // For now, add ambient light base - will add surface lights after model loads
      const baseLight = LightFactory.createAmbientLight(1.7, 0xffffff);
      this.manager.addObject(baseLight);
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
    this._baseQuaternion = scene.quaternion.clone();
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

      // Store radius for later use (lighting, etc)
      this._modelRadius = radius;

      // Place camera so model fits nicely
      // Use custom FOV if provided in data attribute
      const customFov = parseFloat(this.container.dataset.fov);
      const fovDeg = !isNaN(customFov) ? customFov : 110;
      const fov = fovDeg * (Math.PI / 180);
      const distance = Math.abs(radius / Math.sin(fov / 2)) * 1.2;
      
      // Get custom camera Y height if provided
      const customCameraY = parseFloat(this.container.dataset.cameraY);
      const cameraYOffset = !isNaN(customCameraY) ? customCameraY : distance;
      this._customCameraY = cameraYOffset;
      
      // Position camera above the model for top-down view
      this.manager.camera.position.set(0, cameraYOffset, 0);
      this.manager.camera.lookAt(0, 0, 0);

      // Set FOV for the inline camera and update projection
      this.manager.camera.fov = fovDeg;
      this.manager.camera.updateProjectionMatrix();
      
      // Extend frustum distance to avoid clipping when camera moves around (including parallax shifts)
      this.manager.camera.near = 0.1;
      this.manager.camera.far = Math.max(2000, distance * 30, radius * 50);
      this.manager.camera.updateProjectionMatrix();

      this._baseDistance = distance;

      // Add surface lighting with rim lights around the model
      const disableLights = this._getBoolAttr('light', false);
      if (!disableLights) {
        const surfaceLights = LightFactory.createSurfaceLighting(
          radius,
          6,           // 6 lights around the model
          10.6,         // intensity per light
          radius * 1.8, // distance from center
          radius * 0.5  // height offset
        );
        
        // Add all surface lights to scene
        Object.entries(surfaceLights).forEach(([key, light]) => {
          if (Array.isArray(light)) {
            // Array of rim lights
            light.forEach((l) => this.manager.addObject(l));
          } else if (light) {
            // Single light (ambient, key, etc)
            this.manager.addObject(light);
          }
        });
      }
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

    // Account for output zoom to render at higher resolution when zoomed
    const outputZoom = parseFloat(this.container.dataset.outputZoom) || 1.0;
    const effectivePixelRatio = window.devicePixelRatio * Math.max(1, outputZoom);

    this.canvas.width = Math.max(1, Math.floor(rect.width * effectivePixelRatio));
    this.canvas.height = Math.max(1, Math.floor(rect.height * effectivePixelRatio));

    // Update the ThreeManager renderer/camera config if needed
    if (this.manager) {
      // Use the public resize if available
      if (typeof this.manager._resize === 'function') {
        this.manager._resize();
      } else if (this.manager.renderer && this.manager.camera) {
        // Use the actual high-res canvas dimensions for renderer
        const renderWidth = this.canvas.width;
        const renderHeight = this.canvas.height;

        // Update camera aspect ratio based on logical (CSS) size, not render size
        const logicalWidth = rect.width;
        const logicalHeight = rect.height;
        this.manager.camera.aspect = logicalWidth / logicalHeight;
        this.manager.camera.updateProjectionMatrix();

        // Set renderer to high-res canvas size and pixel ratio
        this.manager.renderer.setSize(renderWidth, renderHeight, false);
        this.manager.renderer.setPixelRatio(effectivePixelRatio);
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

    // Get scroll speed multiplier from data attribute
    const scrollSpeed = parseFloat(this.container.dataset.scrollSpeed) || 1.0;

    // Keep camera fixed vertically but adjust horizontally/depth based on container position on page.
    const cameraY = this._customCameraY || 5;
    
    // Horizontal camera adjustment based on where the container is positioned on the page.
    const normalized = (rect.left + rect.width / 2) / window.innerWidth;
    const modelCenterX = (normalized - 0.5) * 2;
    
    // Get parallax amplitude from data attribute (default 1.0 for normal effect).
    const parallaxAmp = parseFloat(this.container.dataset.parallaxAmp) || 5.0;
    
    // Apply inverted parallax (negative modelCenterX) with amplitude control.
    // Clamp limits scale with amplitude to allow proportional camera movement.
    const maxClamp = 3 + parallaxAmp * 2; // allows more movement as amplitude increases
    const cameraX = THREE.MathUtils.clamp(-modelCenterX * 2 * parallaxAmp * scrollSpeed, -maxClamp, maxClamp);
    const cameraZ = THREE.MathUtils.clamp(-modelCenterX * 1.7 * parallaxAmp * scrollSpeed, -maxClamp, maxClamp);

    this.manager.camera.position.set(cameraX, cameraY, cameraZ);

    // Keep camera rotated strictly downwards with explicit roll.
    const roll = parseFloat(this.container.dataset.cameraRoll);
    const cameraRoll = Number.isFinite(roll) ? roll : -Math.PI / 2;
    this.manager.camera.rotation.set(-Math.PI / 2, 0, cameraRoll);

    // Apply scroll-based rotation to the model so it moves naturally while staying centered.
    const spinAmount = (progress - 0.5) * scrollSpeed * Math.PI * 0.5; // +/-90 degrees
    const axisName = (this.container.dataset.scrollAxis || 'z').toLowerCase();
    let axisVector;

    switch (axisName) {
      case 'x':
        axisVector = new THREE.Vector3(1, 0, 0);
        break;
      case 'y':
        axisVector = new THREE.Vector3(0, 1, 0);
        break;
      case 'z':
      default:
        axisVector = new THREE.Vector3(0, 0, 1);
        break;
    }

    if (this.model && this._baseQuaternion) {
      const spinQuat = new THREE.Quaternion().setFromAxisAngle(axisVector, spinAmount);
      this.model.quaternion.copy(this._baseQuaternion).multiply(spinQuat);
    }

    // Keep world matrix updated so projection remains stable.
    this.manager.camera.updateMatrixWorld();

    // Keep the model visually centered in the div by compensating 2D output shift from camera parallax
    if (this.manager.camera && this.canvas) {
      this.manager.camera.updateMatrixWorld();

      // Project world origin (model center) into normalized device coordinates [-1,1]
      const ndc = new THREE.Vector3(0, 0, 0).project(this.manager.camera);
      const canvasRect = this.canvas.getBoundingClientRect();

      // Do NOT clamp NDC - let the offset compensate for off-screen projection
      const projectedX = ((ndc.x + 1) / 2) * canvasRect.width;
      const projectedY = ((-ndc.y + 1) / 2) * canvasRect.height;
      const centerX = canvasRect.width / 2;
      const centerY = canvasRect.height / 2;

      // Calculate offset to re-center the projected model
      const offsetX = centerX - projectedX;
      const offsetY = centerY - projectedY;

      const outputZoom = parseFloat(this.container.dataset.outputZoom) || 1.0;
      const scale = outputZoom > 0 ? outputZoom : 1.0;

      this.canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      this.canvas.style.transformOrigin = 'center center';
    }

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
