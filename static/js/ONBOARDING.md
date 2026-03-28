# Quick Start for New Developers

## 🎯 5-Minute Overview

This is a **Three.js 3D web app** with **MVC architecture**.

### The 3 Layers

| Layer | What | Where |
|-------|------|-------|
| **Model** (Data) | Objects, geometry, materials | `core/`, `models/` |
| **View** (Display) | Visual components, effects | `effects/` |
| **Controller** (Logic) | App flow, scene management | `managers/`, `scenes/`, `main.js` |

### The 3 Key Classes

```javascript
// 1. Main App (in main.js)
class Application { /* Manages everything */ }

// 2. 3D Object Base (in core/BaseObject.js)
class BaseObject { /* All effects extend this */ }

// 3. Scene Controller (in scenes/*.js)
class HomeScene { /* Manages objects for a page */ }
```

---

## 🚀 Your First Task: Add a Rotating Sphere

### 1. Create the effect (`effects/RotatingSphere.js`)

Copy & edit `effects/EffectTemplate.js`:

```javascript
import { BaseObject } from '../core/BaseObject.js';
import { GeometryFactory } from '../models/GeometryFactory.js';
import { MaterialFactory } from '../models/MaterialFactory.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

export class RotatingSphere extends BaseObject {
  async init(context) {
    const geometry = GeometryFactory.createSphere(1, 32, 32);
    const material = MaterialFactory.createPhongMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
    this.addChild(mesh);
  }

  update(time, manager) {
    super.update(time, manager);
    this.object3D.rotation.y += 0.01;
  }
}
```

### 2. Add to home scene (`scenes/HomeScene.js`)

```javascript
import { RotatingSphere } from '../effects/RotatingSphere.js';

async init() {
  const sphere = new RotatingSphere();
  await this.manager.addObject(sphere);
  this.objects.push(sphere);
}
```

### 3. Done! ✅

Reload the page—your sphere appears!

---

## 📂 Folder Purpose at a Glance

```
static/js/
├── core/              ← Framework (don't modify)
├── managers/          ← Services for loading/animating
├── models/            ← Factories for creating objects
├── scenes/            ← Page-specific setup
├── effects/           ← Visual components (YOUR EFFECTS GO HERE)
├── utils/             ← Helper functions
├── config.js          ← Settings
├── main.js            ← Entry point
└── README.md          ← Full docs
```

---

## ⚡ Quick Recipes

### Change an Object's Color

```javascript
// In effect:
const material = MaterialFactory.createPhongMaterial({ color: 0xff0000 });

// Later:
material.color.setHex(0x00ff00);
```

### Position an Object

```javascript
// In init() or update():
this.setPosition(0, 5, 0);  // x, y, z

// Or directly:
this.object3D.position.set(0, 5, 0);
```

### Rotate an Object

```javascript
// In update():
this.object3D.rotation.x += 0.01;
this.object3D.rotation.y += 0.02;

// Or set:
this.setRotation(Math.PI / 4, 0, 0);
```

### Scale an Object

```javascript
this.setScale(2, 2, 2);  // 2x bigger
this.setScale(0.5);      // 0.5x scale (uniform)
```

### Animate Something

```javascript
const managers = window.app.getManagers();
const anim = managers.animations;

anim.tween(
  { value: 0 },
  { value: 10 },
  2000,                // 2 seconds
  'easeInOutQuad',
  () => console.log('Done!')
);
```

### Load a Texture

```javascript
const managers = window.app.getManagers();
const assets = managers.assets;

const texture = await assets.loadTexture('myTex', 'image.png');
const material = MaterialFactory.createPhongMaterial({ map: texture });
```

### Use Custom Shaders

```javascript
const shaders = window.app.getManagers().shaders;

await shaders.loadShader('myShader',
  'static/shaders/custom.vert',
  'static/shaders/custom.frag'
);

const material = shaders.createShaderMaterial(
  'myMat',
  'myShader',
  { u_time: { value: 0 } }
);
```

---

## 🐛 Debugging Checklist

**Object not showing?**
- ✅ Did you call `this.addChild(mesh)`?
- ✅ Is camera positioned right? (check `config.js` CAMERA settings)
- ✅ Is lighting enabled? (check `config.js` LIGHTING)

**Performance slow?**
- ✅ Lower particle counts in `config.js`
- ✅ Reduce geometry complexity
- ✅ Check `window.manager.renderer.info` for stats

**Effect not appearing on page?**
- ✅ Is it in the right `scenes/*.js` file?
- ✅ Does the URL match the scene routing in `main.js`?

**Import errors?**
- ✅ Use full CDN URLs like `'https://cdn.jsdelivr.net/...'`
- ✅ Check file paths are relative: `'../core/...'`

---

## 📋 Common Patterns

### Pattern 1: Simple Rotating Shape

```javascript
export class MyShape extends BaseObject {
  async init(context) {
    const geo = GeometryFactory.createBox(1, 1, 1);
    const mat = MaterialFactory.createPhongMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geo, mat);
    this.addChild(mesh);
  }

  update(time, manager) {
    super.update(time, manager);
    this.object3D.rotation.y += 0.01;
  }
}
```

### Pattern 2: Object with Animation

```javascript
export class AnimatedObject extends BaseObject {
  constructor() {
    super();
    this.animationTime = 0;
  }

  update(time, manager) {
    super.update(time, manager);
    this.animationTime += 0.02;
    this.object3D.position.y = Math.sin(this.animationTime) * 2;
  }
}
```

### Pattern 3: Multiple Objects in One Effect

```javascript
export class MultiObject extends BaseObject {
  async init(context) {
    const geo1 = GeometryFactory.createSphere(1, 32, 32);
    const mesh1 = new THREE.Mesh(geo1, ...);
    this.addChild(mesh1);

    const geo2 = GeometryFactory.createBox(1, 1, 1);
    const mesh2 = new THREE.Mesh(geo2, ...);
    mesh2.position.x = 3;
    this.addChild(mesh2);
  }

  update(time, manager) {
    super.update(time, manager);
    // Update both
  }
}
```

---

## 🔄 Page Routing

The app automatically detects your page and loads the right scene:

```
/                    → HomeScene
/browse              → BrowseScene
/dashboard           → DashboardScene
/profile             → DashboardScene
```

Add a new page? Create `scenes/MyPageScene.js` and register in `main.js`:

```javascript
_setupScenes() {
  this.scenes.set('mypage', new MyPageScene(this.manager));
}

_loadCurrentScene() {
  // ...
  if (path.includes('mypage')) sceneKey = 'mypage';
}
```

---

## 🎬 Next Steps

1. **Read** `README.md` in `/static/js/` (full docs)
2. **Check** example effects in `/effects/`
3. **Browse** `ARCHITECTURE.md` for deep dive
4. **Create** your first effect!

---

## 💪 Pro Tips

✅ **Use factories** - `GeometryFactory`, `MaterialFactory`, `LightFactory`

✅ **Extend BaseObject** - Ensures consistency

✅ **One effect per file** - Keeps code organized

✅ **Put page logic in scenes** - Not in `main.js`

✅ **Use utils** - `ColorUtils`, `MathUtils`, `CameraUtils`

✅ **Enable debug mode** - Helps during development

---

## 🆘 Help Resources

| Question | Answer | Where |
|----------|--------|-------|
| How do I... | See quick recipes above ↑ | This file |
| General architecture | Read ARCHITECTURE.md | Root folder |
| Complete API | Check README.md | `/static/js/` |
| Code examples | Look at effects | `/static/js/effects/` |
| Three.js docs | Official docs | https://threejs.org |

---

**Ready to code?** Let's go! 🚀

Pick an effect file and customize it. You got this! 💪

l
