/**
 * utils/MathUtils.js
 * Common mathematical operations and utilities
 */

export class MathUtils {
  /**
   * Linear interpolation
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Map a value from one range to another
   */
  static map(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  }

  /**
   * Random number between min and max
   */
  static random(min = 0, max = 1) {
    return min + Math.random() * (max - min);
  }

  /**
   * Random integer between min and max (inclusive)
   */
  static randomInt(min, max) {
    return Math.floor(this.random(min, max + 1));
  }

  /**
   * Degrees to radians
   */
  static toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Radians to degrees
   */
  static toDegrees(radians) {
    return (radians * 180) / Math.PI;
  }

  /**
   * Smoothstep function
   */
  static smoothstep(edge0, edge1, x) {
    const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }
}
