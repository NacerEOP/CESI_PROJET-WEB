/**
 * utils/ColorUtils.js
 * Color manipulation and utility functions
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

export class ColorUtils {
  /**
   * Convert HSL to RGB hex color
   */
  static hslToHex(h, s, l) {
    const color = new THREE.Color();
    color.setHSL(h, s, l);
    return color.getHexString();
  }

  /**
   * Interpolate between two colors
   */
  static lerpColor(colorA, colorB, t) {
    const c1 = new THREE.Color(colorA);
    const c2 = new THREE.Color(colorB);
    return c1.lerp(c2, t).getHex();
  }

  /**
   * Get random color
   */
  static randomColor() {
    return Math.floor(Math.random() * 0xffffff);
  }

  /**
   * Brighten a color
   */
  static brighten(hex, amount = 0.2) {
    const color = new THREE.Color(hex);
    color.multiplyScalars(1 + amount, 1 + amount, 1 + amount);
    return color.getHex();
  }

  /**
   * Darken a color
   */
  static darken(hex, amount = 0.2) {
    const color = new THREE.Color(hex);
    color.multiplyScalars(1 - amount, 1 - amount, 1 - amount);
    return color.getHex();
  }
}
