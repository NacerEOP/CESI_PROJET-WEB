# New Three.js Architecture - Setup Guide

## What Changed? 🧩

**Before (Deleted):**
- `GLapp.js` - Raw WebGL manager
- `ShaderProgram.js` - Manual shader compilation
- `ShaderEffects.js` - Complex low-level rendering

**After (New Modular System):**
- `core/` - Framework classes for managing everything
- `effects/` - Your custom reusable effects
- Everything is class-based and modular! ✨

## Quick Integration Steps

### Step 1: Update Your Template Files

In any `.twig.html` template that needs 3D graphics:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        * { margin: 0; padding: 0; }
        body { overflow: hidden; }
        #canvas { display: block; width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <canvas id="canvas"></canvas>
    <script type="module" src="/static/js/main.js"></script>
</body>
</html>
```

### Step 2: Customize `main.js` for Your Page

Edit `static/js/main.js` to add your specific effects:

```javascript
async _setupEffects() {
  // Add Home Page Effects
  if (window.location.pathname === '/') {
    const hero = new RotatingGeometry('Hero', { color: 0x00ffff });
    await this.manager.addObject(hero);
  }

  // Add Browse Page Effects
  if (window.location.pathname.includes('browse')) {
    const particles = new ParticleSystem('Browse');
    await this.manager.addObject(particles);
  }
}
```

### Step 3: Create Your Custom Effects

Make a new file `static/js/effects/MyPageEffect.js`:

```javascript
import { BaseObject } from '../core/BaseObject.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

export class MyPageEffect extends BaseObject {
  async init(context) {
    // Your 3D setup here
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
    const mesh = new THREE.Mesh(geometry, material);
    this.addChild(mesh);
  }

  update(time, manager) {
    super.update(time, manager);
    // Animation code
  }
}
```

Then use it:
```javascript
import { MyPageEffect } from './effects/MyPageEffect.js';

const effect = new MyPageEffect();
await this.manager.addObject(effect);
```

## File Structure (After Refactor)

```
static/js/
├── core/                         # ✅ NEW: Framework
│   ├── ThreeManager.js          # Main app manager
│   ├── BaseObject.js            # Base class for all objects
│   ├── ShaderManager.js         # Custom shader support
│   ├── AssetLoader.js           # Load textures/models
│   └── AnimationManager.js      # Tween animations
│
├── effects/                     # ✅ NEW: Your effects folder
│   ├── EffectTemplate.js        # Copy this to make new effects
│   ├── RotatingGeometry.js      # Example
│   ├── ParticleSystem.js        # Example
│   └── CurvedTrackEffect.js     # Your old curved shader (rewritten)
│
├── main.js                      # Entry point (updated)
├── README.md                    # Full documentation
│
├── animations.js                # ⚠️ Keep for non-3D animations
├── home.js                      # ⚠️ Keep for page-specific logic
├── SlideShow.js                 # ⚠️ Keep existing
│
├── shaders/                     # ⚠️ Keep for custom shaders!
│   ├── curved.vert
│   └── curved.frag
└── styles/                      # ⚠️ Keep all styles
```

## Using Your Old Shader Files

Your `curved.vert` and `curved.frag` still work! Use them with the new system:

```javascript
// In main.js setup:
const effect = new CurvedTrackEffect();
await this.manager.addObject(effect);
```

The `CurvedTrackEffect.js` shows how to integrate your shaders with Three.js.

## Common Tasks

### Add a Rotating Model with Texture

```javascript
import { BaseObject } from '../core/BaseObject.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

export class TexturedModel extends BaseObject {
  async init(context) {
    // Load texture
    const texture = await this.app.assetLoader.loadTexture(
      'myTexture',
      'path/to/image.png'
    );

    // Create mesh with texture
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    this.addChild(mesh);
  }

  update(time, manager) {
    super.update(time, manager);
    // Rotate
    this.object3D.rotation.y += 0.01;
  }
}
```

### Add Animations

```javascript
// Using built-in AnimationManager
const target = { x: 0, y: 0 };

app.animationManager.tween(
  target,
  { x: 10, y: 5 },
  2000,  // 2 seconds
  'easeInOutQuad',
  () => console.log('Done!')
);
```

### Load a 3D Model

```javascript
async init(context) {
  const model = await this.app.assetLoader.loadGLTF(
    'myModel',
    'path/to/model.glb'
  );
  
  this.addChild(model.scene);
}
```

## Next Steps

1. ✅ Copy `effects/EffectTemplate.js` and customize it
2. ✅ Import it in `main.js`
3. ✅ Add it to the scene with `await manager.addObject(yourEffect)`
4. ✅ Check `README.md` for detailed documentation
5. ✅ Reference example effects for patterns

## Troubleshooting

### "Module not found" errors
- Use full URLs like `https://cdn.jsdelivr.net/...`
- Make sure paths in HTML script tag are correct

### Objects not showing
- Check that you called `this.addChild()` in `init()`
- Verify camera position and clipping planes
- Ensure material is visible (not transparent black)

### Performance issues
- Lower particle counts
- Reduce geometry complexity
- Cache geometries/materials instead of recreating them

## Questions?

Check the example effects:
- `RotatingGeometry.js` - Basic mesh
- `ParticleSystem.js` - Particles
- `CurvedTrackEffect.js` - Custom shaders
- `EffectTemplate.js` - Template for new effects

Good luck! 🚀
