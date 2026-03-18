/**
 * AnimationManager.js
 * Manages object animations and transitions
 * Supports basic tweens and keyframe animations
 */

export class AnimationManager {
  constructor() {
    this.animations = [];
    this.time = 0;
  }

  /**
   * Create a simple tween animation
   * @param {object} target - Target object with properties to animate
   * @param {object} to - Target values
   * @param {number} duration - Duration in milliseconds
   * @param {string} easing - Easing function name
   * @param {function} onComplete - Callback when complete
   */
  tween(target, to, duration = 1000, easing = 'linear', onComplete = null) {
    const from = {};
    Object.keys(to).forEach(key => {
      from[key] = target[key];
    });

    const animation = {
      target,
      from,
      to,
      duration,
      easing: this._getEasing(easing),
      onComplete,
      startTime: this.time,
      finished: false
    };

    this.animations.push(animation);
    return animation;
  }

  /**
   * Update all animations
   */
  update(deltaTime) {
    this.time += deltaTime;

    for (let i = this.animations.length - 1; i >= 0; i--) {
      const anim = this.animations[i];
      if (anim.finished) continue;

      const elapsed = this.time - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1);
      const easeProgress = anim.easing(progress);

      Object.keys(anim.to).forEach(key => {
        const start = anim.from[key];
        const end = anim.to[key];
        anim.target[key] = start + (end - start) * easeProgress;
      });

      if (progress >= 1) {
        anim.finished = true;
        if (anim.onComplete) anim.onComplete();
        this.animations.splice(i, 1);
      }
    }
  }

  /**
   * Remove an animation
   */
  remove(animation) {
    const index = this.animations.indexOf(animation);
    if (index !== -1) {
      this.animations.splice(index, 1);
    }
  }

  /**
   * Clear all animations
   */
  clear() {
    this.animations = [];
  }

  _getEasing(name) {
    const easings = {
      linear: t => t,
      easeInQuad: t => t * t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * (t - 2)) * (2 * (t - 2)) + 1
    };

    return easings[name] || easings.linear;
  }
}
