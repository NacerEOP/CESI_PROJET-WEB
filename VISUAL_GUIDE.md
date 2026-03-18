# 🎨 Visual Architecture Guide

## 🏗️ System At a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                  HTML Page (User View)                      │
│                  <canvas id="canvas">                       │
└────────────────────────┬────────────────────────────────────┘
                         │ WebGL Rendering
                         ↓
┌─────────────────────────────────────────────────────────────┐
│            Three.js Render Engine (ThreeManager)            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Scene │ Camera │ Renderer │ Lights │ Objects        │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬─────────────────────────────────────────┘
                   │ Calls update() on effects
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                    Effects (Views)                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ RotatingGeometry  ParticleSystem  CurvedTrackEffect │   │
│  │  (extends BaseObject - all 3D components)           │   │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────┬────────────────┬────────────────────────┘
                   │                │
         Uses factories      Uses managers
                   │                │
          ┌────────↓──────┐  ┌──────↓────────┐
          │    MODELS     │  │   MANAGERS    │
          │  (Factories)  │  │  (Services)   │
          ├───────────────┤  ├───────────────┤
          │Geometry       │  │Shader         │
          │Material       │  │Asset          │
          │Light          │  │Animation      │
          └───────────────┘  └───────────────┘
                   ↑                 ↑
        Called by effects      Called by effects
```

---

## 🔄 Data Flow Diagram

```
USER VISITS PAGE
    ↓
main.js initializes Application
    ↓
Application creates ThreeManager
    ↓
Application loads URL-matching Scene
(HomeScene / BrowseScene / DashboardScene)
    ↓
Scene.init() creates Effects
    ↓
Effects.init() uses Factories & Managers
    ├── GeometryFactory → creates geometry
    ├── MaterialFactory → creates material
    ├── LightFactory → creates lights
    ├── ShaderManager → loads shaders
    ├── AssetLoader → loads textures/models
    └── AnimationManager → creates tweens
    ↓
ThreeManager.addObject() adds to scene
    ↓
Render loop starts
    ↓
Each frame:
  Effects.update(time) called
    ├── Update positions
    ├── Update rotations
    ├── Update animations
    └── Update shader uniforms
    ↓
    WebGL renders frame
    ↓
    Browser displays on canvas
```

---

## 📊 Component Ownership Diagram

```
                    ┌─ CONFIG.js
                    │ (Global settings)
                    │
APPLICATION (main.js)
    │
    ├─ ThreeManager
    │   ├─ Scene
    │   ├─ Camera
    │   └─ Renderer
    │
    ├─ Managers
    │   ├─ ShaderManager
    │   ├─ AssetLoader
    │   └─ AnimationManager
    │
    └─ Scenes
        ├─ HomeScene ─┐
        │   ├─ Effects (RotatingGeometry, ParticleSystem)
        │   └─ Uses managers & factories
        │
        ├─ BrowseScene ─┐
        │   ├─ Effects (ParticleSystem, RotatingGeometry)
        │   └─ Uses managers & factories
        │
        └─ DashboardScene
            ├─ Effects (RotatingGeometry, etc)
            └─ Uses managers & factories

All Effects extend BaseObject
All Effects use Factories when creating objects
All Effects call manager methods for resources
```

---

## 🎯 Responsibility Matrix

| Component | Creates | Manages | Uses |
|-----------|---------|---------|------|
| **ThreeManager** | Scene, Camera, Renderer | Render loop, object lifecycle | Nothing (root) |
| **Scene** | Effects | Scene-specific effects | Manager, Factories |
| **Effects** | Meshes, Groups | Own visuals | Factories, Managers |
| **Factories** | Geometries, Materials, Lights | Created objects | Nothing (pure) |
| **Managers** | Animations, Shaders, Assets | Resources | Nothing (pure) |

---

## 🧬 Inheritance Hierarchy

```
THREE.Object3D (Three.js core)
    ↑
    │ extends
    │
BaseObject
    ↑
    │ extends
    │
┌──────────────────┬──────────────────┬──────────────────┐
│                  │                  │                  │
RotatingGeometry   ParticleSystem   CurvedTrackEffect   YourEffect
│                  │                  │                  │
├─ init()          ├─ init()          ├─ init()          ├─ init()
├─ update()        ├─ update()        ├─ update()        ├─ update()
└─ dispose()       └─ dispose()       └─ dispose()       └─ dispose()
```

---

## 🔌 Manager Architecture

```
Application
    │
    └─ getManagers() returns:
        {
            three: ThreeManager,
            shaders: ShaderManager,
            assets: AssetLoader,
            animations: AnimationManager
        }

// Access in effects:
const managers = window.app.getManagers();
const shaders = managers.shaders;
const assets = managers.assets;
const animations = managers.animations;
```

---

## 📁 Folder Purpose Tree

```
static/js/
│
├─ core/
│  └─ Framework essentials (don't modify)
│     ├─ ThreeManager → controls everything
│     └─ BaseObject → all effects inherit
│
├─ managers/
│  └─ Service controllers (one job each)
│     ├─ ShaderManager → manage shaders
│     ├─ AssetLoader → load resources
│     └─ AnimationManager → handle tweens
│
├─ models/
│  └─ Data creation (consistency)
│     ├─ GeometryFactory → create geometries
│     ├─ MaterialFactory → create materials
│     └─ LightFactory → create lights
│
├─ scenes/
│  └─ Page controllers (one per page)
│     ├─ HomeScene → homepage setup
│     ├─ BrowseScene → browse page setup
│     └─ DashboardScene → dashboard setup
│
├─ effects/
│  └─ Visual components (copy & customize)
│     ├─ EffectTemplate → copy this
│     ├─ RotatingGeometry → example
│     ├─ ParticleSystem → example
│     └─ CurvedTrackEffect → example
│
├─ utils/
│  └─ Helper functions (pure)
│     ├─ ColorUtils → color math
│     ├─ MathUtils → general math
│     └─ CameraUtils → camera helpers
│
└─ config.js
   └─ Global settings (one place to change)
```

---

## 🎬 Page Routing Flow

```
User navigates to /browse
    ↓
Browser loads page
    ↓
<script src="/static/js/main.js"> executes
    ↓
Application.init()
    ↓
_loadCurrentScene() checks window.location.pathname
    ↓
Matches '/browse' → loads BrowseScene
    ↓
BrowseScene.init() creates effects
    ├─ ParticleSystem (main visual)
    └─ RotatingGeometry (background)
    ↓
Effects rendered to canvas
    ↓
User sees 3D content
```

---

## 🎨 Creating an Effect (Flow)

```
START: Want to create custom 3D effect
    ↓
Copy: effects/EffectTemplate.js → effects/MyEffect.js
    ↓
Edit:
┌──────────────────────────────────┐
│ export class MyEffect extends    │
│ BaseObject {                     │
│   async init(context) {          │
│     // Create 3D objects here    │
│     const geometry = ...         │ → Use factories!
│     const material = ...         │
│     const mesh = ...             │
│     this.addChild(mesh);         │
│   }                              │
│                                  │
│   update(time, manager) {        │
│     // Animate here              │
│     this.object3D.rotation...   │
│   }                              │
│ }                                │
└──────────────────────────────────┘
    ↓
Add to scene: scenes/HomeScene.js
    ├─ import MyEffect
    ├─ const effect = new MyEffect()
    ├─ await manager.addObject(effect)
    └─ this.objects.push(effect)
    ↓
Reload page
    ↓
✅ Your effect appears!
```

---

## 🔧 Configuration Cascade

```
config.js (top-level)
    ↓
APPLICATION
    ├─ Reading CONFIG.CAMERA settings
    ├─ Reading CONFIG.SCENE settings
    ├─ Reading CONFIG.LIGHTING settings
    └─ Reading CONFIG.EFFECTS to load
        ├─ CONFIG.EFFECTS.HOME_PAGE
        ├─ CONFIG.EFFECTS.BROWSE_PAGE
        └─ CONFIG.EFFECTS.DASHBOARD_PAGE
    ↓
Individual effects
    └─ Can override with constructor options
        ├─ new RotatingGeometry('name', { custom options })
        └─ Options override defaults
```

---

## 📈 Scalability Path

```
Week 1: Simple static scene
  └─ 1 effect, 1 page

Week 2: Add animations
  └─ 2-3 effects per page, AnimationManager usage

Week 3: Multiple pages
  └─ HomeScene, BrowseScene, DashboardScene

Week 4: Load resources
  └─ AssetLoader for textures/models

Month 2: Custom shaders
  └─ ShaderManager for GLSL effects

Month 3: Advanced features
  └─ Particle systems, physics, interactions
  └─ Complex multi-page app with 3D
```

---

## 💾 Memory & Performance

```
Startup (First Visit)
├─ Download Three.js (CDN) → 200KB
├─ Parse JS files → <100ms
├─ Create managers → instant
├─ Load first scene → depends on assets
└─ Total → <1 second typical

Runtime (Each Frame)
├─ Call effects' update() → <5ms
├─ Update geometries → <5ms
├─ Render WebGL frame → <4ms @ 60fps
└─ Total → ~16ms per frame

Memory (Typical Scene)
├─ Framework → ~10MB
├─ Textures → varies
├─ Geometries → ~50-100MB
└─ Total → ~100-200MB typical
```

---

## 🎓 Knowledge Graph

```
HTML/Twig Template
    ↓ declares
Canvas + Script tag
    ↓ loads
main.js (Application entry)
    ├─ creates
    │  ThreeManager (controls rendering)
    │
    ├─ creates
    │  Scenes (page-specific logic)
    │  ├─ creates → Effects
    │  └─ uses → Factories, Managers
    │
    ├─ provides
    │  Managers (services)
    │  ├─ ShaderManager
    │  ├─ AssetLoader
    │  └─ AnimationManager
    │
    ├─ reads
    │  config.js (global settings)
    │
    └─ manages
       Lifecycle (init → render loop → dispose)
```

---

## 🚀 Quick Decision Tree

```
I want to...

├─ Add 3D to a page
│  └─ Create scenes/MyPageScene.js
│
├─ Create a visual effect
│  └─ Copy effects/EffectTemplate.js
│
├─ Change app settings
│  └─ Edit config.js
│
├─ Create geometries consistently
│  └─ Use GeometryFactory
│
├─ Create materials consistently
│  └─ Use MaterialFactory
│
├─ Load textures/models
│  └─ Use AssetLoader
│
├─ Animate a value
│  └─ Use AnimationManager.tween()
│
├─ Use custom GLSL shaders
│  └─ Use ShaderManager
│
├─ Do color math
│  └─ Use ColorUtils
│
├─ Do general math
│  └─ Use MathUtils
│
├─ Position the camera
│  └─ Use CameraUtils
│
└─ Understand the full picture
   └─ Read ARCHITECTURE.md
```

---

## ✅ Implementation Checklist

```
Before you code:
  ☐ Read ONBOARDING.md
  ☐ Understand MVC layers
  ☐ Check example effects
  
While coding:
  ☐ Extend BaseObject
  ☐ Use factories for objects
  ☐ Implement init() and update()
  ☐ Use managers for resources
  ☐ Follow naming conventions
  
After coding:
  ☐ Test in browser
  ☐ Check console for errors
  ☐ Inspect with DevTools
  ☐ Optimize if needed
  ☐ Deploy with confidence
```

---

**That's the visual guide!** 🎨

Everything is organized, modular, and ready to scale. Start with the quick decision tree above, then reference the detailed diagrams as needed.

**Ready?** Copy an effect template and build! 🚀
