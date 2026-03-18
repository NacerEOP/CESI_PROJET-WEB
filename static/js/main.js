/**
 * main.js
 * Application entry point and main controller
 * 
 * Initializes the 3D application with proper scene management
 * based on the current page / route
 */

import { ThreeManager } from './core/ThreeManager.js';
import { ShaderManager } from './managers/ShaderManager.js';
import { AssetLoader } from './managers/AssetLoader.js';
import { AnimationManager } from './managers/AnimationManager.js';

// Import scenes
import { HomeScene } from './scenes/HomeScene.js';
import { BrowseScene } from './scenes/BrowseScene.js';
import { DashboardScene } from './scenes/DashboardScene.js';

// Import configuration
import { CONFIG, getPageConfig } from './config.js';

/**
 * Main Application Controller
 * Manages all managers and scene lifecycle
 */
class Application {
  constructor() {
    // Core Three.js manager
    this.manager = null;

    // Resource managers
    this.shaderManager = null;
    this.assetLoader = null;
    this.animationManager = null;

    // Current scene
    this.currentScene = null;
    this.scenes = new Map();

    // Lifecycle
    this.initialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Get or create canvas
      const canvas = document.getElementById(CONFIG.CANVAS.ID) || this._createCanvas();

      // Initialize Three.js manager
      this.manager = new ThreeManager(canvas, {
        dpr: CONFIG.CANVAS.DPR,
        antialias: CONFIG.CANVAS.ANTIALIAS,
        alpha: CONFIG.CANVAS.ALPHA
      });

      // Initialize all managers
      this.shaderManager = new ShaderManager();
      this.assetLoader = new AssetLoader();
      this.animationManager = new AnimationManager();

      // Set up scene library
      this._setupScenes();

      // Load appropriate scene for current page
      await this._loadCurrentScene();

      // Start render loop
      this.manager.start();

      this.initialized = true;
      console.log('✅ Application initialized');

      // Debug info
      if (CONFIG.DEBUG.ENABLED) {
        window.app = this;
        window.manager = this.manager;
        console.log('💡 Debug mode - app and manager available in window');
      }

    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      throw error;
    }
  }

  /**
   * Set up all scenes
   */
  _setupScenes() {
    this.scenes.set('home', new HomeScene(this.manager));
    this.scenes.set('browse', new BrowseScene(this.manager));
    this.scenes.set('dashboard', new DashboardScene(this.manager));
  }

  /**
   * Load scene based on current page
   */
  async _loadCurrentScene() {
    const path = window.location.pathname;
    let sceneKey = 'home';

    if (path.includes('browse')) sceneKey = 'browse';
    else if (path.includes('dashboard')) sceneKey = 'dashboard';
    else if (path.includes('profile')) sceneKey = 'dashboard';

    const scene = this.scenes.get(sceneKey);
    if (!scene) {
      console.warn(`Scene not found: ${sceneKey}, using home scene`);
      this.currentScene = this.scenes.get('home');
    } else {
      this.currentScene = scene;
    }

    await this.currentScene.init();
    console.log(`📍 Loaded scene: ${sceneKey}`);
  }

  /**
   * Switch to a different scene
   */
  async switchScene(sceneKey) {
    try {
      // Clean up current scene
      if (this.currentScene && this.currentScene.dispose) {
        this.currentScene.dispose();
      }

      // Load new scene
      const scene = this.scenes.get(sceneKey);
      if (!scene) {
        throw new Error(`Scene not found: ${sceneKey}`);
      }

      this.currentScene = scene;
      await this.currentScene.init();
      console.log(`📍 Switched to scene: ${sceneKey}`);
    } catch (error) {
      console.error('Failed to switch scene:', error);
    }
  }

  /**
   * Create a canvas if one doesn't exist
   */
  _createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = CONFIG.CANVAS.ID;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    document.body.appendChild(canvas);
    return canvas;
  }

  /**
   * Clean up all resources
   */
  dispose() {
    // Dispose current scene
    if (this.currentScene && this.currentScene.dispose) {
      this.currentScene.dispose();
    }

    // Dispose all managers
    if (this.manager) this.manager.dispose();
    if (this.shaderManager) this.shaderManager.dispose();
    if (this.assetLoader) this.assetLoader.dispose();

    this.initialized = false;
    console.log('✅ Application disposed');
  }

  /**
   * Get manager references (for external access)
   */
  getManagers() {
    return {
      three: this.manager,
      shaders: this.shaderManager,
      assets: this.assetLoader,
      animations: this.animationManager
    };
  }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    window.app = new Application();
    await window.app.init();
  });
} else {
  window.app = new Application();
  window.app.init();
}

export { Application };
