/**
 * effects/ParticleSystem.js
 * Particle system effect
 * Emits and animates particles from a position
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { BaseObject } from '../core/BaseObject.js';

export class ParticleSystem extends BaseObject {
  constructor(name = 'ParticleSystem', options = {}) {
    super(name);
    
    this.particleCount = options.particleCount || 1000;
    this.particleSize = options.particleSize || 2;
    this.emissionRate = options.emissionRate || 50; // particles per frame
    this.lifetime = options.lifetime || 3000; // milliseconds
    this.speed = options.speed || 1;

    this.particles = [];
    this.activeParticles = [];
  }

  async init(context) {
    // Create particle geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create material
    const material = new THREE.PointsMaterial({
      size: this.particleSize,
      vertexColors: true,
      transparent: true,
      sizeAttenuation: true
    });

    // Create points
    this.points = new THREE.Points(geometry, material);
    this.addChild(this.points);

    this.isInitialized = true;
  }

  /**
   * Emit particles from a position
   */
  emit(position, count = 1) {
    for (let i = 0; i < count; i++) {
      const particle = {
        x: position.x + (Math.random() - 0.5) * 0.5,
        y: position.y + (Math.random() - 0.5) * 0.5,
        z: position.z + (Math.random() - 0.5) * 0.5,
        vx: (Math.random() - 0.5) * this.speed * 2,
        vy: (Math.random() - 0.5) * this.speed * 2,
        vz: (Math.random() - 0.5) * this.speed * 2,
        startTime: this._time,
        life: 1
      };
      this.activeParticles.push(particle);
    }
  }

  update(time, manager) {
    super.update(time, manager);

    const positions = this.points.geometry.attributes.position.array;

    // Update particles
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      const age = time - p.startTime;
      p.life = Math.max(0, 1 - age / this.lifetime);

      if (p.life <= 0) {
        this.activeParticles.splice(i, 1);
        continue;
      }

      // Update position
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      // Apply gravity
      p.vy -= 0.01;

      // Update geometry
      const idx = i * 3;
      positions[idx] = p.x;
      positions[idx + 1] = p.y;
      positions[idx + 2] = p.z;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    super.dispose();
    this.activeParticles = [];
  }
}
