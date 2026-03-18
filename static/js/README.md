# Three.js + WebGL Modular Architecture

## 🏗️ MVC-Inspired Organization

This project follows an **MVC-like pattern** tailored for 3D web applications:

```
static/js/
├── core/                    # Framework (Models)
│   ├── ThreeManager.js      # Main Three.js app controller
│   ├── BaseObject.js        # Base class for all 3D objects
│   └── ...
│
├── managers/                # Controllers & Services
│   ├── ShaderManager.js     # Shader compilation & uniforms
│   ├── AssetLoader.js       # Texture & model loading
│   └── AnimationManager.js  # Tween animations
│
├── models/                  # Data Models & Factories
│   ├── GeometryFactory.js   # Create geometries
│   ├── MaterialFactory.js   # Create materials
│   └── LightFactory.js      # Create lighting
│
├── scenes/                  # Scene Controllers (Page-specific)
│   ├── HomeScene.js         # Homepage 3D scene
│   ├── BrowseScene.js       # Browse/catalog scene
│   └── DashboardScene.js    # Dashboard/profile scene
│
├── effects/                 # Views/Reusable Components
│   ├── EffectTemplate.js   # Template for new effects
│   ├── RotatingGeometry.js # Rotating shape component
│   ├── ParticleSystem.js   # Particle effect component
│   └── CurvedTrackEffect.js# Custom shader component
│
├── utils/                   # Helper Utilities
│   ├── ColorUtils.js       # Color manipulation
│   ├── MathUtils.js        # Math helpers
│   └── CameraUtils.js      # Camera utilities
│
├── config.js               # Global configuration
├── main.js                 # Application entry point
└── README.md               # This file
```

## 📋 MVC Pattern Explanation

| Layer | What | Where | Purpose |
|-------|------|-------|---------|
| **Model** | Data, factories, scene structure | `core/`, `models/` | Define 3D objects & data |
| **View** | Visual rendering, effects | `effects/` | Render and display |
| **Controller** | Business logic, app flow | `managers/`, `scenes/`, `main.js` | Orchestrate everything |

## 🚀 Quick Start

### 1. HTML Setup

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

### 2. Create a Custom Effect

**Copy `effects/EffectTemplate.js`:**

```javascript
import { BaseObject } from '../core/BaseObject.js';
import { GeometryFactory } from '../models/GeometryFactory.js';
import { MaterialFactory } from '../models/MaterialFactory.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

export class MyCustomEffect extends BaseObject {
  async init(context) {
    // Use factories for consistency
    const geometry = GeometryFactory.createBox(1, 1, 1);
    const material = MaterialFactory.createPhongMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    this.addChild(mesh);
  }

  update(time, manager) {
    super.update(time, manager);
    // Animation code
  }
}
```

### 3. Add to a Scene

**Edit `scenes/HomeScene.js`:**

```javascript
import { MyCustomEffect } from '../effects/MyCustomEffect.js';

export class HomeScene {
  async init() {
    const effect = new MyCustomEffect();
    await this.manager.addObject(effect);
    this.objects.push(effect);
  }
}
```

## 📦 Key Components

### Core Framework

| File | Purpose |
|------|---------|
| `ThreeManager.js` | Main app: scene, camera, renderer, loops |
| `BaseObject.js` | Base class: init, update, dispose lifecycle |

### Resource Managers

| File | Purpose |
|------|---------|
| `ShaderManager.js` | Load & manage GLSL shaders |
| `AssetLoader.js` | Load textures, GLTF, FBX models |
| `AnimationManager.js` | Tween animations with easing |

### Model Factories

Use these to create objects consistently:

```javascript
// Geometries
GeometryFactory.createBox(w, h, d)
GeometryFactory.createSphere(radius, segW, segH)
GeometryFactory.createCone(radius, height, segments)
GeometryFactory.createTorus(radius, tubeRadius, ...)

// Materials
MaterialFactory.createPhongMaterial({ color: 0x00ff00 })
MaterialFactory.createStandardMaterial({ metalness: 0.8 })
MaterialFactory.createPointMaterial({ size: 2 })

// Lighting
LightFactory.createDirectionalLight(intensity)
LightFactory.createAmbientLight(intensity)
LightFactory.createDefaultLighting()  // 3-point setup
```

### Utilities

```javascript
import { ColorUtils } from './utils/ColorUtils.js';
import { MathUtils } from './utils/MathUtils.js';
import { CameraUtils } from './utils/CameraUtils.js';

// Color
ColorUtils.hslToHex(h, s, l)
ColorUtils.lerpColor(color1, color2, t)
ColorUtils.randomColor()

// Math
MathUtils.lerp(a, b, t)
MathUtils.clamp(value, min, max)
MathUtils.map(value, inMin, inMax, outMin, outMax)
MathUtils.toRadians(degrees)
MathUtils.smoothstep(edge0, edge1, x)

// Camera
CameraUtils.focusOn(camera, target, distance)
CameraUtils.orbitAround(camera, target, radius, theta, phi)
```

### Configuration

Edit `config.js` to change global settings:

```javascript
export const CONFIG = {
  CANVAS: { DPR, ANTIALIAS, ALPHA },
  SCENE: { BACKGROUND_COLOR, FOG_ENABLED },
  CAMERA: { FOV, NEAR, FAR },
  LIGHTING: { ENABLED, INTENSITIES },
  EFFECTS: { HOME_PAGE, BROWSE_PAGE, ... },
  DEBUG: { ENABLED, SHOW_STATS }
};
```

## 🎬 Scene System

Each page has its own scene controller in `scenes/`:

```javascript
// Automatically routes based on page URL
window.location.pathname === '/' → HomeScene
window.location.pathname includes 'browse' → BrowseScene
window.location.pathname includes 'dashboard' → DashboardScene
```

### Switch Scenes Programmatically

```javascript
await window.app.switchScene('browse');
```

## 🧩 Adding New Pages

1. Create `scenes/MyPageScene.js`:
```javascript
export class MyPageScene {
  constructor(manager) { this.manager = manager; }
  async init() { /* Add effects */ }
  dispose() { /* Cleanup */ }
}
```

2. Register in `main.js`:
```javascript
this.scenes.set('mypage', new MyPageScene(this.manager));
```

3. Add routing logic in `_loadCurrentScene()`:
```javascript
if (path.includes('mypage')) sceneKey = 'mypage';
```

## 🎨 Advanced: Custom Shaders

```javascript
// 1. Load shader files
const shaders = window.app.getManagers().shaders;
await shaders.loadShader('myShader', 
  'static/shaders/my.vert',
  'static/shaders/my.frag'
);

// 2. Create material
const material = shaders.createShaderMaterial(
  'matName',
  'myShader',
  { u_time: { value: 0 } }
);

// 3. Use and update
mesh.material = material;
shaders.updateUniforms('matName', { u_time: time * 0.001 });
```

## 💾 How to Use AssetLoader

```javascript
const assets = window.app.getManagers().assets;

// Load texture
const texture = await assets.loadTexture('myTex', 'image.png');
const material = new THREE.MeshPhongMaterial({ map: texture });

// Load model
const gltf = await assets.loadGLTF('myModel', 'model.glb');
scene.add(gltf.scene);

// Retrieve later
const tex = assets.getTexture('myTex');
const model = assets.getModel('myModel');
```

## 🎬 Animation with AnimationManager

```javascript
const anim = window.app.getManagers().animations;

const target = { x: 0, y: 0 };

anim.tween(
  target,                    // Target object
  { x: 10, y: 5 },          // End values
  2000,                      // Duration (ms)
  'easeInOutQuad',           // Easing
  () => console.log('Done!')  // Callback
);

// Available easings: linear, easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic
```

## 🔍 Debugging

Enable debug mode in `config.js`:

```javascript
DEBUG: {
  ENABLED: true,
  SHOW_STATS: true
}
```

Then in console:
```javascript
window.app              // Access application
window.manager          // Access three manager
window.app.getManagers()  // Get all managers
```

## 🗂️ File Organization Philosophy

- **core/** - Framework that never changes
- **managers/** - Reusable services (like controllers)
- **models/** - Factories for creating data
- **scenes/** - Page-specific logic
- **effects/** - Reusable visual components
- **utils/** - Helper functions

This keeps code **DRY**, **modular**, and **maintainable**.

## 🚀 Performance Tips

1. **Reuse geometries/materials** - Use factories
2. **Dispose resources** - Override `dispose()` in effects
3. **LOD for complex models** - Check Three.js LOD
4. **Limit particle counts** - Adjust in config
5. **Use THREE.InstancedMesh** for many identical objects

## 📚 Resources

- [Three.js Docs](https://threejs.org/docs)
- [GLSL Documentation](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
- [Three.js Examples](https://threejs.org/examples)

---

**Questions?** Check example effects or create issues!

