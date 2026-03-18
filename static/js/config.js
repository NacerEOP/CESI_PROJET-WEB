/**
 * config.js
 * Global configuration and constants
 * Centralized settings for the entire 3D application
 */

export const CONFIG = {
  // Canvas Settings
  CANVAS: {
    ID: 'canvas',
    DPR: window.devicePixelRatio,
    ANTIALIAS: true,
    ALPHA: true
  },

  // Scene Settings
  SCENE: {
    BACKGROUND_COLOR: 0x000000,
    FOG_ENABLED: false,
    FOG_COLOR: 0xffffff,
    FOG_NEAR: 1,
    FOG_FAR: 1000
  },

  // Camera Settings
  CAMERA: {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
    START_POSITION: { x: 0, y: 0, z: 5 }
  },

  // Lighting Settings
  LIGHTING: {
    ENABLED: true,
    AMBIENT_INTENSITY: 0.6,
    DIRECTIONAL_INTENSITY: 0.8
  },

  // Performance Settings
  PERFORMANCE: {
    MAX_PARTICLES: 10000,
    LOD_ENABLED: false,
    SHADOW_MAP_ENABLED: false
  },

  // Effects Settings
  EFFECTS: {
    HOME_PAGE: ['RotatingGeometry'],
    BROWSE_PAGE: ['ParticleSystem'],
    DASHBOARD_PAGE: ['RotatingGeometry', 'ParticleSystem'],
    DEFAULT: ['RotatingGeometry']
  },

  // Animation Settings
  ANIMATION: {
    DEFAULT_DURATION: 1000,
    DEFAULT_EASING: 'easeInOutQuad'
  },

  // Debug Settings
  DEBUG: {
    ENABLED: false,
    SHOW_STATS: false,
    SHOW_GRID: false
  }
};

/**
 * Get page-specific configuration
 */
export function getPageConfig(pagePath) {
  const path = pagePath.toLowerCase();

  if (path.includes('browse')) return CONFIG.EFFECTS.BROWSE_PAGE;
  if (path.includes('dashboard')) return CONFIG.EFFECTS.DASHBOARD_PAGE;
  if (path === '/') return CONFIG.EFFECTS.HOME_PAGE;

  return CONFIG.EFFECTS.DEFAULT;
}
