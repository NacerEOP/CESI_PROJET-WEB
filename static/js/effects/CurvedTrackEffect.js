/**
 * effects/CurvedTrackEffect.js
 * 
 * Curved track shader effect (migrated from old raw WebGL)
 * Shows how to use custom GLSL shaders with the new Three.js system
 * 
 * The old curved.vert and curved.frag shaders are reused here!
 */

import { BaseObject } from '../core/BaseObject.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

export class CurvedTrackEffect extends BaseObject {
  constructor(name = 'CurvedTrack', options = {}) {
    super(name);

    // Configuration
    this.panelCount = options.panelCount || 24;
    this.fillRatio = options.fillRatio || 0.75;
    this.radius = options.radius || 26.9;
    this.h0 = options.h0 || -12.0;
    this.h1 = options.h1 || 12.0;

    this.speedRot = options.speedRot || 0.2;
    this.speedSlide = options.speedSlide || 0.0;

    this.shaderMaterial = null;
  }

  async init(context) {
    const { scene } = context;

    // Calculate geometry
    const step = (Math.PI * 2) / this.panelCount;
    const halfArc = (step * this.fillRatio) * 0.5;

    // Create quad geometry for each panel
    const geometry = new THREE.BufferGeometry();

    // Build vertices for all panels
    const positions = [];
    const panelIds = [];

    for (let i = 0; i < this.panelCount; i++) {
      const baseTheta = i * step;

      // Quad vertices (localTheta, height)
      const vertices = [
        [-halfArc, this.h0],
        [halfArc, this.h0],
        [-halfArc, this.h1],
        [halfArc, this.h1]
      ];

      for (const [localTheta, h] of vertices) {
        positions.push(baseTheta + localTheta, h, 0);
        panelIds.push(i);
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('panelId', new THREE.BufferAttribute(new Float32Array(panelIds), 1));

    // Load and create shader material
    const shaderSources = await this._loadShaders();

    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: shaderSources.vertex,
      fragmentShader: shaderSources.fragment,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(800, 600) },
        u_fov: { value: 1.2 },
        u_camZ: { value: -5.0 },
        u_radius: { value: this.radius },
        u_thetaGlobal: { value: 0 },
        u_slide: { value: 0 }
      },
      side: THREE.DoubleSide
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, this.shaderMaterial);
    this.addChild(mesh);

    this.isInitialized = true;
  }

  /**
   * Load shader sources from files
   */
  async _loadShaders() {
    try {
      const [vertexSource, fragmentSource] = await Promise.all([
        fetch('static/shaders/curved.vert').then(r => r.text()),
        fetch('static/shaders/curved.frag').then(r => r.text())
      ]);

      return { vertex: vertexSource, fragment: fragmentSource };
    } catch (error) {
      console.error('Failed to load shaders:', error);
      // Fallback to basic shaders
      return {
        vertex: `
          varying float vPanelId;
          void main() {
            vPanelId = length(normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragment: `
          varying float vPanelId;
          void main() {
            gl_FragColor = vec4(vPanelId, 0.5, 1.0, 1.0);
          }
        `
      };
    }
  }

  update(time, manager) {
    super.update(time, manager);

    if (this.shaderMaterial) {
      const t = time * 0.001;
      this.shaderMaterial.uniforms.u_time.value = t;
      this.shaderMaterial.uniforms.u_thetaGlobal.value = t * this.speedRot;
      this.shaderMaterial.uniforms.u_slide.value = t * this.speedSlide;
      this.shaderMaterial.uniforms.u_resolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    }
  }

  dispose() {
    super.dispose();
    if (this.shaderMaterial) this.shaderMaterial.dispose();
  }
}
