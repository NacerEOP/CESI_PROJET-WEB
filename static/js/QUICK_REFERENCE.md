/**
 * QUICK REFERENCE - Three.js Modular Architecture API
 * 
 * Copy this as a cheat sheet while developing!
 */

// ============================================
// 1. CREATE APP (in main.js)
// ============================================
import { ThreeManager } from './core/ThreeManager.js';
import { ShaderManager } from './core/ShaderManager.js';
import { AssetLoader } from './core/AssetLoader.js';
import { AnimationManager } from './core/AnimationManager.js';

const manager = new ThreeManager(canvas);
const shaders = new ShaderManager();
const assets = new AssetLoader();
const animations = new AnimationManager();


// ============================================
// 2. CREATE A CUSTOM EFFECT
// ============================================
import { BaseObject } from './core/BaseObject.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

class MyEffect extends BaseObject {
  async init(context) {
    // context = { scene, camera, renderer, canvas }
    const mesh = new THREE.Mesh(geometry, material);
    this.addChild(mesh);  // Add to your group
  }

  update(time, manager) {
    super.update(time, manager);
    this.object3D.rotation.x += 0.01;
  }
}


// ============================================
// 3. USE IN MAIN
// ============================================
const effect = new MyEffect('Name');
await manager.addObject(effect);      // Add to scene
manager.addEffect(effect);            // Add to render loop
manager.removeObject(effect);         // Remove from scene
manager.start();                      // Begin rendering


// ============================================
// 4. THREEJS MANAGER API
// ============================================
manager.getContext()           // { scene, camera, renderer, canvas }
manager.scene                  // THREE.Scene
manager.camera                 // THREE.Camera
manager.renderer               // THREE.WebGLRenderer
manager.addObject(obj)         // Add object to scene
manager.removeObject(obj)      // Remove from scene
manager.addEffect(effect)      // Add to render loop
manager.removeEffect(effect)   // Remove from loop
manager.start()                // Start rendering
manager.stop()                 // Stop rendering
manager.dispose()              // Clean up everything


// ============================================
// 5. BASE OBJECT API (for your effects)
// ============================================
effect.name                    // String name
effect.object3D                // THREE.Group (root)
effect.isInitialized           // Boolean
effect.isVisible               // Boolean

effect.setVisible(true)        // Toggle visibility
effect.getPosition()           // Returns THREE.Vector3
effect.setPosition(x, y, z)    // Set position
effect.getRotation()           // Returns THREE.Euler
effect.setRotation(x, y, z)    // Set rotation (radians)
effect.getScale()              // Returns THREE.Vector3
effect.setScale(x, y, z)       // Set scale

effect.addChild(mesh)          // Add child mesh/group
effect.removeChild(mesh)       // Remove child
effect.dispose()               // Clean up resources


// ============================================
// 6. SHADER MANAGER API
// ============================================
await shaders.loadShader('myShader', 'path/vert.glsl', 'path/frag.glsl');

const mat = shaders.createShaderMaterial('matName', 'myShader', {
  u_time: { value: 0 },
  u_color: { value: new THREE.Vector3(1, 0, 0) }
});

shaders.updateUniforms('matName', {
  u_time: time * 0.001
});


// ============================================
// 7. ASSET LOADER API
// ============================================
const tex = await assets.loadTexture('tex', 'image.png');
const gltf = await assets.loadGLTF('model', 'model.glb');
const fbx = await assets.loadFBX('model', 'model.fbx');

assets.getTexture('tex')
assets.getModel('model')


// ============================================
// 8. ANIMATION MANAGER API
// ============================================
const target = { x: 0, y: 0 };

animations.tween(
  target,           // Object to animate
  { x: 10, y: 5 },  // Target values
  1000,             // Duration (ms)
  'easeInOutQuad',  // Easing: linear, easeInQuad, easeOutQuad, etc
  () => {}          // onComplete callback (optional)
);

animations.update(deltaTime);  // Call in update loop
animations.remove(anim);
animations.clear();


// ============================================
// 9. COMMON THREE.JS OBJECTS
// ============================================
// Geometries
new THREE.BoxGeometry(w, h, d)
new THREE.SphereGeometry(radius, w, h)
new THREE.ConeGeometry(radius, height, segments)
new THREE.CylinderGeometry(radTop, radBot, height, segs)
new THREE.PlaneGeometry(width, height)

// Materials
new THREE.MeshPhongMaterial({ color: 0xff0000 })
new THREE.MeshStandardMaterial({ metalness: 0.8 })
new THREE.PointsMaterial({ size: 2 })
new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })

// Creating mesh
const mesh = new THREE.Mesh(geometry, material);
const points = new THREE.Points(geometry, material);
const group = new THREE.Group();

// Adding to scene
manager.scene.add(mesh);      // Direct to scene
this.addChild(mesh);          // To your BaseObject


// ============================================
// 10. VECTOR & POSITION SHORTCUTS
// ============================================
new THREE.Vector2(x, y)
new THREE.Vector3(x, y, z)
new THREE.Vector4(x, y, z, w)

// Euler rotations (in radians)
object.rotation.set(x, y, z)
object.rotation.x = Math.PI / 2

// Scale
object.scale.set(x, y, z)

// Position
object.position.set(x, y, z)


// ============================================
// CONVERSION: OLD WEBGL → NEW THREE.JS
// ============================================

// OLD:
// GLApp + ShaderProgram + ShaderEffects (raw WebGL)

// NEW:
// ThreeManager + BaseObject + ShaderManager (Three.js)

// Equivalent Setup:
// OLD: new GLApp(canvas)
// NEW: new ThreeManager(canvas) + manager.start()

// OLD: effect.init(gl, app)
// NEW: await manager.addObject(effect)

// OLD: Drawing with raw GLSL
// NEW: THREE.ShaderMaterial({ vertexShader, fragmentShader })

// OLD: Manual buffer management
// NEW: THREE.BufferGeometry with BufferAttribute


// ============================================
// DEBUGGING TIPS
// ============================================
console.log(manager.scene);           // Inspect scene tree
console.log(manager.renderer.info);   // Performance stats
manager.renderer.setPixelRatio(1);    // Reduce for debugging

// Add to window for console access
window.manager = manager;
window.app = app;
