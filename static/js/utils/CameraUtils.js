/**
 * utils/CameraUtils.js
 * Camera positioning and manipulation utilities
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

export class CameraUtils {
  /**
   * Position camera to look at an object with distance
   */
  static focusOn(camera, targetObject, distance = 5, offset = { x: 0, y: 0, z: 0 }) {
    const pos = targetObject.position;
    camera.position.set(
      pos.x + offset.x + distance,
      pos.y + offset.y + distance,
      pos.z + offset.z + distance
    );
    camera.lookAt(pos);
  }

  /**
   * Orbit camera around target
   */
  static orbitAround(camera, target, radius, theta, phi) {
    const x = target.x + radius * Math.sin(phi) * Math.cos(theta);
    const y = target.y + radius * Math.cos(phi);
    const z = target.z + radius * Math.sin(phi) * Math.sin(theta);
    
    camera.position.set(x, y, z);
    camera.lookAt(target.x, target.y, target.z);
  }

  /**
   * Smooth camera transition
   */
  static transitionTo(camera, targetPos, duration, easing) {
    return {
      camera,
      startPos: camera.position.clone(),
      targetPos,
      duration,
      easing,
      elapsed: 0
    };
  }
}
