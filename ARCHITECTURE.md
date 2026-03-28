# Three.js Architecture - Complete Organization Guide

## 🏗️ MVC Architecture for 3D Web Apps

This project applies **Model-View-Controller (MVC)** principles to a Three.js application. Here's how the pattern maps:

### Model (Data & Structures)
**Where:** `core/`, `models/`

- **core/BaseObject.js** - Abstract data model for 3D objects
- **models/GeometryFactory.js** - Data structure creation (meshes, shapes)
- **models/MaterialFactory.js** - Material definitions
- **models/LightFactory.js** - Lighting setup

**Responsibility:** Define *what* exists in 3D space

### View (Rendering & Visuals)
**Where:** `effects/`

- **effects/RotatingGeometry.js** - Visual component (rotating shape)
- **effects/ParticleSystem.js** - Visual component (particles)
- **effects/CurvedTrackEffect.js** - Visual component (custom shader)
- **effects/EffectTemplate.js** - Reusable effect template

**Responsibility:** Define *how* objects look and render

### Controller (Business Logic)
**Where:** `managers/`, `scenes/`, `core/ThreeManager.js`

- **core/ThreeManager.js** - Main app controller (lifecycle, rendering)
- **managers/ShaderManager.js** - Shader logic controller
- **managers/AssetLoader.js** - Asset loading logic
- **managers/AnimationManager.js** - Animation logic
- **scenes/HomeScene.js** - Page-specific controller
- **main.js** - Application entry controller

**Responsibility:** Orchestrate models & views, handle app flow

---

## 📁 Deep Dive: Folder Organization

### `/core` - Framework Foundation

```
core/
├── ThreeManager.js    # Main app manager (global controller)
└── BaseObject.js      # Base class (abstract model)
```

**ThreeManager.js** is your main controller:
- Creates scene, camera, renderer
- Manages render loop
- Adds/removes objects
- Lifecycle management

**BaseObject.js** is your model base:
- All 3D objects inherit from this
- Defines init() → update() → dispose() lifecycle
- Standard methods: setPosition(), setRotation(), setScale()

### `/managers` - Service Controllers

```
managers/
├── ShaderManager.js      # Shader compilation & management
├── AssetLoader.js        # Resource loading
└── AnimationManager.js   # Tween animations
```

Each manager is a **service controller**:
- One responsibility each
- Encapsulates an aspect of the system
- Accessed via `window.app.getManagers()`

### `/models` - Data Factories

```
models/
├── GeometryFactory.js    # Create geometries
├── MaterialFactory.js    # Create materials
└── LightFactory.js       # Create lights
```

**Factories** centralize object creation:
- Ensure consistency
- Make maintenance easier
- Abstract complexity

**Example:**
```javascript
// Instead of:
new THREE.BoxGeometry(1, 1, 1)
new THREE.MeshPhongMaterial({ color: 0xff0000 })

// Use:
GeometryFactory.createBox(1, 1, 1)
MaterialFactory.createPhongMaterial({ color: 0xff0000 })
```

### `/scenes` - Page-Specific Controllers

```
scenes/
├── HomeScene.js       # Homepage visualizations
├── BrowseScene.js     # Browse/catalog page
└── DashboardScene.js  # User dashboard
```

Each scene is a **page controller**:
- Creates and initializes effects for that page
- Manages scene-specific objects
- Handles cleanup and disposal
- Automatically loaded based on URL

**Example:**
```javascript
// In HomeScene.js
async init() {
  const cube = new RotatingGeometry('hero');
  await this.manager.addObject(cube);
  this.objects.push(cube);
}

dispose() {
  this.objects.forEach(obj => obj.dispose());
}
```

### `/effects` - Visual Components

```
effects/
├── BaseObject.js (extends)  ← Base model
├── RotatingGeometry.js      # Rotating shape component
├── ParticleSystem.js        # Particle effect component
├── CurvedTrackEffect.js     # Custom shader component
└── EffectTemplate.js        # Template
```

Effects are **reusable view components**:
- Extend BaseObject
- Self-contained
- Used across multiple scenes
- Example-based code

**Example:**
```javascript
export class MyEffect extends BaseObject {
  async init(context) {
    // Create visuals
    const mesh = new THREE.Mesh(geo, mat);
    this.addChild(mesh);
  }

  update(time, manager) {
    // Animate
    this.object3D.rotation.y += 0.01;
  }
}
```

### `/utils` - Helper Functions

```
utils/
├── ColorUtils.js      # Color manipulation
├── MathUtils.js       # Math operations
└── CameraUtils.js     # Camera helpers
```

Utilities are **pure functions** (no state):
- Reusable algorithms
- No side effects
- Easy to test

**Example:**
```javascript
MathUtils.lerp(10, 20, 0.5)        // → 15
ColorUtils.lerpColor(color1, color2, 0.5)
CameraUtils.focusOn(camera, target, 5)
```

---

## 🔄 Data Flow Example

Let's trace data flow from user interaction:

```
1. User navigates to /browse
   ↓
2. main.js detects URL change
   ↓
3. _loadCurrentScene() loaded BrowseScene
   ↓
4. BrowseScene.init() creates effects
   ↓
5. ParticleSystem extends BaseObject (model)
   ↓
6. ParticleSystem defines visuals in init() (view)
   ↓
7. ThreeManager adds to scene (controller)
   ↓
8. Render loop calls update() each frame (controller)
   ↓
9. ParticleSystem updates positions (model)
   ↓
10. WebGL renders frame (view)
```

Each component has ONE responsibility!

---

## 👁️ Component Interaction Diagram

```
┌─────────────────────────────────────────────────┐
│                Application (main.js)            │
│            Entry point & central control        │
└──────┬──────────────────────────────────────────┘
       │
       ├─ THREE MANAGERS ─────────────────┐
       │  ├── ShaderManager               │── Resource
       │  ├── AssetLoader                 │   Management
       │  └── AnimationManager            │
       │                                  │
       ├─ SCENE CONTROLLERS ──────────┐  │
       │  ├── HomeScene                │  │
       │  ├── BrowseScene              │  │
       │  └── DashboardScene           │  │
       │                               │  │
       ├─ THREE MANAGER ────────────━━┛  │
       │  (Scene, Camera, Renderer)      │
       │                                 │
       └─ EFFECTS (BaseObject subclasses)└─ Rendering
          ├── RotatingGeometry               Loop
          ├── ParticleSystem
          └── CurvedTrackEffect
```

---

## 🎯 How to Add a New Feature

### Scenario: Add a "Animated Text" effect

**Step 1: Create the effect** (`effects/AnimatedText.js`)
```javascript
import { BaseObject } from '../core/BaseObject.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

export class AnimatedText extends BaseObject {
  constructor(text = 'Hello', options = {}) {
    super('AnimatedText');
    this.text = text;
    this.options = options;
  }

  async init(context) {
    // Use font loader, create text geometry, add to scene
    // View layer: Define how text looks
  }

  update(time, manager) {
    // Animate text
    // Model layer: Update data
  }
}
```

**Step 2: Use in a scene** (`scenes/HomeScene.js`)
```javascript
import { AnimatedText } from '../effects/AnimatedText.js';

async init() {
  const text = new AnimatedText('Welcome!');
  await this.manager.addObject(text);
  this.objects.push(text);
}
```

**Step 3: Done!**

The component automatically integrates with:
- ThreeManager (scene management)
- AnimationManager (if needed)
- Render loop (lifecycle)

---

## 🔌 Example: Adding Global Config

**In `config.js`:**
```javascript
EFFECTS: {
  ANIMATED_TEXT_SIZE: 2,
  ANIMATED_TEXT_COLOR: 0xff0000
}
```

**In your effect:**
```javascript
import { CONFIG } from '../config.js';

async init(context) {
  const geometry = new THREE.TextGeometry(this.text, {
    size: CONFIG.EFFECTS.ANIMATED_TEXT_SIZE
  });
  // ...
}
```

Changes propagate everywhere!

---

## 🧹 Cleanup & Best Practices

### Resource Disposal

Every effect should implement `dispose()`:

```javascript
export class MyEffect extends BaseObject {
  dispose() {
    super.dispose();  // Calls parent disposal
    // Custom cleanup if needed
  }
}
```

ThreeManager calls dispose() automatically.

### Naming Convention

| Prefix | Type | Example |
|--------|------|---------|
| `My*` | Custom effect | `MyCustomEffect` |
| `*Factory` | Factory class | `GeometryFactory` |
| `*Manager` | Manager service | `ShaderManager` |
| `*Scene` | Scene controller | `HomeScene` |
| `*Utils` | Utility class | `ColorUtils` |

### File Organization Rules

1. **One class per file** (with rare exceptions)
2. **Descriptive names** (avoid `util.js`, use `ColorUtils.js`)
3. **Related files together** (effects in `effects/`)
4. **Factories in `models/`** (centralized creation)
5. **Controllers in dedicated folders** (`managers/`, `scenes/`)

---

## 🚀 Performance Considerations

### Memory Model
- **Geometries**: Created once, reused (factories)
- **Materials**: Created once, reused (factories)
- **Meshes**: Created per-object (view)
- **Scenes**: One per page (scene controllers)

### Render Optimization
- **LOD (Level of Detail)** for complex models
- **InstancedMesh** for thousands of identical objects
- **Culling** - Remove offscreen objects
- **Texture atlasing** - Combine textures

**In config:**
```javascript
PERFORMANCE: {
  MAX_PARTICLES: 10000,
  LOD_ENABLED: false,
  SHADOW_MAP_ENABLED: false
}
```

---

## 🔍 Debugging Workflow

**Enable debug mode in `config.js`:**
```javascript
DEBUG: {
  ENABLED: true,
  SHOW_STATS: true
}
```

**In console:**
```javascript
window.app                          // Application instance
window.manager                      // ThreeManager instance
window.app.getManagers()            // All managers
window.app.currentScene.objects     // Scene objects

// Inspect scene graph
window.manager.scene.children       // All objects in scene

// Get rendering stats
window.manager.renderer.info        // Geometry, textures, calls
```

---

## 📊 Project Statistics

```
Lines of Code: ~2,000+ (framework & examples)
Files: 20+
Dependencies: 1 (Three.js via CDN)
Build Tools: None (ES modules)
Bundle Size: ~200KB (Three.js CDN)
```

---

## 🎓 Learning Path

1. **Day 1**: Understand `ThreeManager`, `BaseObject`
2. **Day 2**: Create first effect (extend BaseObject)
3. **Day 3**: Use factories (Geometry, Material)
4. **Day 4**: Create a scene (combine effects)
5. **Day 5**: Load custom shaders
6. **Day 6**: Handle animations & interactions
7. **Day 7**: Optimize & deploy

---

## 📚 File Reference Quick Lookup

| Need | File | Method |
|------|------|--------|
| Add object to scene | `ThreeManager` | `addObject()` |
| Create geometry | `GeometryFactory` | `createBox()` etc |
| Create mesh | `MaterialFactory` | `createPhongMaterial()` etc |
| Create light | `LightFactory` | `createAmbientLight()` etc |
| Load texture | `AssetLoader` | `loadTexture()` |
| Animate value | `AnimationManager` | `tween()` |
| Shader effect | `ShaderManager` | `createShaderMaterial()` |
| Color math | `ColorUtils` | `lerpColor()` etc |
| General math | `MathUtils` | `lerp()`, `map()` etc |
| Move camera | `CameraUtils` | `focusOn()` etc |

---

## 🎉 You're Ready!

This architecture scales from simple one-page apps to complex multi-page experiences. Follow the patterns, stay organized, and build amazing 3D web experiences!

**Questions?** Check example effects or refer to the inline code comments.

Happy coding! 🚀


this is another test