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
    this._resizeObserver = null;
    this._isInitialSetup = true;

    this._onScroll = this._onScroll.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onContainerResize = this._onContainerResize.bind(this);
    this._update = this._update.bind(this);
  }

  async init() {
    this._setupCanvas();
    this.manager = new ThreeManager(this.canvas, { alpha: true, antialias: true });

    // Resize immediately on init BEFORE loading model
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
    
    // Mark initial setup as complete - future resizes will recalculate camera position
    this._isInitialSetup = false;
    
    // Initial update
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

      // Position camera to fit the model
      this._positionCamera();

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

  _positionCamera() {
    const radius = this._modelRadius;
    if (!radius) return;

    // Use custom FOV if provided in data attribute
    const customFov = parseFloat(this.container.dataset.fov);
    const fovDeg = !isNaN(customFov) ? customFov : 110;
    const fov = fovDeg * (Math.PI / 180);

    // Calculate half angles based on aspect ratio
    const halfFovVertical = fov / 2;
    const aspect = this.manager.camera.aspect;
    const halfFovHorizontal = Math.atan(Math.tan(halfFovVertical) * aspect);

    // The limiting angle is the smaller one
    const limitingAngle = Math.min(halfFovVertical, halfFovHorizontal);

    // Always calculate distance based on aspect ratio and model size
    const calculatedDistance = Math.abs(radius / Math.sin(limitingAngle)) * 1.2;
    
    // For camera Y: on initial setup, use data-camera-y if provided
    // On resize, always use calculated distance so model scales responsively
    let cameraYOffset;
    if (this._isInitialSetup) {
      const customCameraY = parseFloat(this.container.dataset.cameraY);
      cameraYOffset = !isNaN(customCameraY) ? customCameraY : calculatedDistance;
    } else {
      // On resize: always use calculated distance so the model scales
      cameraYOffset = calculatedDistance;
    }
    
    this._customCameraY = cameraYOffset;
    
    this.manager.camera.position.set(0, cameraYOffset, 0);
    this.manager.camera.lookAt(0, 0, 0);

    // Set FOV for the inline camera and update projection
    this.manager.camera.fov = fovDeg;
    this.manager.camera.updateProjectionMatrix();
    
    // Extend frustum distance to avoid clipping when camera moves around (including parallax shifts)
    this.manager.camera.near = 0.1;
    this.manager.camera.far = Math.max(2000, calculatedDistance * 30, radius * 50);
    this.manager.camera.updateProjectionMatrix();

    this._baseDistance = calculatedDistance;
  }

  _getBoolAttr(name, defaultValue) {
    const attr = this.container.dataset[name];
    if (attr === undefined) return defaultValue;
    return attr.toLowerCase() !== 'false';
  }

  _resizeCanvas() {
    if (!this.canvas || !this.manager || !this.manager.renderer || !this.manager.camera) return;

    // Get the actual displayed size of the canvas element
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    if (width <= 0 || height <= 0) return;

    // Get pixel ratio accounting for zoom
    const outputZoom = parseFloat(this.container.dataset.outputZoom) || 1.0;
    const pixelRatio = window.devicePixelRatio * Math.max(1, outputZoom);

    // Ensure canvas CSS dimensions stay at 100% so attribute width/height don't override
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';

    // Manually set canvas pixel dimensions to match the displayed size
    this.canvas.width = Math.round(width * pixelRatio);
    this.canvas.height = Math.round(height * pixelRatio);

    // Set renderer to render at the displayed size
    // Pass updateStyle=false so we don't override our careful CSS setup
    this.manager.renderer.setPixelRatio(1); // We've already accounted for pixel ratio in canvas dimensions
    this.manager.renderer.setSize(width, height, false);

    // Update camera aspect
    const newAspect = width / height;
    this.manager.camera.aspect = newAspect;
    this.manager.camera.updateProjectionMatrix();

    // Reposition camera to fit the model
    if (this._modelRadius) {
      this._positionCamera();
    }
  }

  _registerListeners() {
    window.addEventListener('scroll', this._onScroll, { passive: true });
    window.addEventListener('resize', this._onResize);

    // Use ResizeObserver to watch for container size changes
    if (window.ResizeObserver) {
      this._resizeObserver = new ResizeObserver(this._onContainerResize);
      this._resizeObserver.observe(this.container);
    }
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

  _onContainerResize() {
    this._needsUpdate = true;
    this._resizeCanvas();
    
    // Force an immediate update to render changes
    if (this._raf) {
      cancelAnimationFrame(this._raf);
    }
    this._raf = null;
    this._update();
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

    // Keep camera fixed vertically but adjust horizontally/depth based on container position in viewport.
    const cameraY = this._customCameraY || 5;
    
    // Horizontal progress: 0 when container is at left edge of viewport, 1 when at right edge
    const horizontalProgress = Math.min(1, Math.max(0, (rect.left + rect.width / 2) / window.innerWidth));
    const horizontalOffset = (horizontalProgress - 0.5) * 2; // -1 to +1 range
    
    // Get parallax amplitude from data attribute (default 0 for no parallax)
    const parallaxAmp = parseFloat(this.container.dataset.parallaxAmp) || 0;
    
    // Apply parallax - subtle camera movement
    const maxClamp = 3;
    const cameraX = THREE.MathUtils.clamp(horizontalOffset * parallaxAmp, -maxClamp, maxClamp);
    const cameraZ = THREE.MathUtils.clamp(horizontalOffset * parallaxAmp * 0.7, -maxClamp, maxClamp);

    this.manager.camera.position.set(cameraX, cameraY, cameraZ);

    // Keep camera rotated strictly downwards with explicit roll.
    const roll = parseFloat(this.container.dataset.cameraRoll);
    const cameraRoll = Number.isFinite(roll) ? roll : -Math.PI / 2;
    this.manager.camera.rotation.set(-Math.PI / 2, 0, cameraRoll);

    // Apply scroll-based rotation to the model (original perfect rotation)
    const spinAmount = (progress - 0.5) * scrollSpeed * Math.PI * 0.5; // +/-90 degrees
    const scrollAxis = (this.container.dataset.scrollAxis || 'z').toLowerCase();
    let scrollAxisVector;

    switch (scrollAxis) {
      case 'x':
        scrollAxisVector = new THREE.Vector3(1, 0, 0);
        break;
      case 'y':
        scrollAxisVector = new THREE.Vector3(0, 1, 0);
        break;
      case 'z':
      default:
        scrollAxisVector = new THREE.Vector3(0, 0, 1);
        break;
    }

    // Get parallax rotation axis (default 'x' for horizontal parallax rotation)
    const parallaxRotationAmp = parseFloat(this.container.dataset.parallaxRotationAmp) || 0;
    const parallaxAxis = (this.container.dataset.parallaxRotationAxis || 'x').toLowerCase();
    const parallaxRotationLimit = 0.3; // Clamp parallax rotation to ±0.3 radians (~17 degrees) for natural look
    let parallaxAxisVector;

    switch (parallaxAxis) {
      case 'x':
        parallaxAxisVector = new THREE.Vector3(1, 0, 0);
        break;
      case 'y':
        parallaxAxisVector = new THREE.Vector3(0, 1, 0);
        break;
      case 'z':
      default:
        parallaxAxisVector = new THREE.Vector3(0, 0, 1);
        break;
    }

    // Apply both rotations to model
    if (this.model && this._baseQuaternion) {
      // Scroll-based rotation
      const scrollQuat = new THREE.Quaternion().setFromAxisAngle(scrollAxisVector, spinAmount);
      
      // Parallax-based rotation on different axis (clamped for natural look)
      const clampedParallaxRotation = THREE.MathUtils.clamp(horizontalOffset * parallaxRotationAmp, -parallaxRotationLimit, parallaxRotationLimit);
      const parallaxQuat = new THREE.Quaternion().setFromAxisAngle(parallaxAxisVector, clampedParallaxRotation);
      
      // Combine both rotations
      this.model.quaternion.copy(this._baseQuaternion).multiply(scrollQuat).multiply(parallaxQuat);
    }

    // Keep world matrix updated so projection remains stable.
    this.manager.camera.updateMatrixWorld();

    // Keep the model visually centered in the div by compensating 2D output shift from camera parallax
    if (this.manager.camera && this.canvas) {
      this.manager.camera.updateMatrixWorld();

      // Project world origin (model center) into normalized device coordinates [-1,1]
      const ndc = new THREE.Vector3(0, 0, 0).project(this.manager.camera);
      
      // Use container's client dimensions (the actual CSS display size)
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      // Do NOT clamp NDC - let the offset compensate for off-screen projection
      const projectedX = ((ndc.x + 1) / 2) * width;
      const projectedY = ((-ndc.y + 1) / 2) * height;
      const centerX = width / 2;
      const centerY = height / 2;

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
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
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
