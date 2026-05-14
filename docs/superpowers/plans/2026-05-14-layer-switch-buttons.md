# Layer Switch Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add page-level buttons that switch between overview and each radar height layer.

**Architecture:** Add a top-level `RADAR_IMAGES` constant shared by `SceneContent` and a new `LayerControls` component. `LayerControls` writes to the existing `selectedLayer` state, so existing camera and map-follow behavior stays unchanged.

**Tech Stack:** React 19, TypeScript, Vite, React Three Fiber, drei, Leaflet.

---

### Task 1: Add Failing Verification

**Files:**
- Create: `scripts/verify-layer-switch-buttons.mjs`

- [x] **Step 1: Create verification script**

Create `scripts/verify-layer-switch-buttons.mjs`:

```javascript
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

const checks = [
  {
    name: 'RADAR_IMAGES is a top-level shared constant',
    pass: /const RADAR_IMAGES = \\['\\/radar1\\.png'[\\s\\S]*?'\\/radar6\\.png'\\]/.test(source),
  },
  {
    name: 'LayerControls component exists',
    pass: /const LayerControls = \\(\\{\\s*selectedLayer,\\s*setSelectedLayer\\s*\\}/s.test(source),
  },
  {
    name: 'LayerControls includes overview button',
    pass: /setSelectedLayer\\(null\\)[\\s\\S]*全览/.test(source),
  },
  {
    name: 'LayerControls renders km buttons from RADAR_IMAGES',
    pass: /RADAR_IMAGES\\.map\\(\\(_, index\\)/.test(source) && /\\{index\\} km/.test(source),
  },
  {
    name: 'App renders LayerControls',
    pass: /<LayerControls selectedLayer=\\{selectedLayer\\} setSelectedLayer=\\{setSelectedLayer\\} \\/>/.test(source),
  },
  {
    name: 'SceneContent uses RADAR_IMAGES',
    pass: /const images = RADAR_IMAGES/.test(source),
  },
]

const failed = checks.filter((check) => !check.pass)

for (const check of checks) {
  console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}`)
}

if (failed.length > 0) {
  process.exitCode = 1
}
```

- [x] **Step 2: Run verification and confirm it fails**

Run:

```bash
node scripts/verify-layer-switch-buttons.mjs
```

Expected before implementation:

```text
FAIL RADAR_IMAGES is a top-level shared constant
FAIL LayerControls component exists
FAIL LayerControls includes overview button
FAIL LayerControls renders km buttons from RADAR_IMAGES
FAIL App renders LayerControls
FAIL SceneContent uses RADAR_IMAGES
```

### Task 2: Implement Layer Controls

**Files:**
- Modify: `src/App.tsx`

- [x] **Step 1: Add shared radar image constant**

Add after imports:

```tsx
const RADAR_IMAGES = ['/radar1.png', '/radar2.png', '/radar3.png', '/radar4.png', '/radar5.png', '/radar6.png']
```

- [x] **Step 2: Add LayerControls component**

Add before `function App()`:

```tsx
const LayerControls = ({
  selectedLayer,
  setSelectedLayer,
}: {
  selectedLayer: number | null
  setSelectedLayer: (id: number | null) => void
}) => {
  const buttonStyle = (active: boolean) => ({
    padding: '8px 16px',
    background: active ? 'rgba(0, 255, 255, 0.2)' : 'transparent',
    border: active ? '1px solid #00ffff' : '1px solid rgba(255, 255, 255, 0.1)',
    color: active ? '#00ffff' : '#ffffff',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'sans-serif',
  })

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        background: 'rgba(11, 20, 36, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
      }}
    >
      <span style={{ color: '#ffffff', fontSize: '12px', fontFamily: 'sans-serif' }}>高度层级</span>
      <button type="button" aria-pressed={selectedLayer === null} onClick={() => setSelectedLayer(null)} style={buttonStyle(selectedLayer === null)}>
        全览
      </button>
      {RADAR_IMAGES.map((_, index) => (
        <button key={index} type="button" aria-pressed={selectedLayer === index} onClick={() => setSelectedLayer(index)} style={buttonStyle(selectedLayer === index)}>
          {index} km
        </button>
      ))}
    </div>
  )
}
```

- [x] **Step 3: Use shared constant in SceneContent**

Replace:

```tsx
  const images = ['/radar1.png', '/radar2.png', '/radar3.png', '/radar4.png', '/radar5.png', '/radar6.png']
```

with:

```tsx
  const images = RADAR_IMAGES
```

- [x] **Step 4: Render LayerControls and remove old reset button**

In `App`, render:

```tsx
      <LayerControls selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} />
```

Remove the old conditional `重置视图` button block.

### Task 3: Verify

**Files:**
- Test: `scripts/verify-layer-switch-buttons.mjs`

- [x] **Step 1: Run static verification**

Run:

```bash
node scripts/verify-layer-switch-buttons.mjs
```

Expected:

```text
PASS RADAR_IMAGES is a top-level shared constant
PASS LayerControls component exists
PASS LayerControls includes overview button
PASS LayerControls renders km buttons from RADAR_IMAGES
PASS App renders LayerControls
PASS SceneContent uses RADAR_IMAGES
```

- [x] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected:

```text
✓ built
```

- [x] **Step 3: Browser smoke check**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Verify:

```text
Buttons 全览, 0 km, and 5 km exist.
Clicking 3 km shows 高度 3 km 详情.
Clicking 全览 returns to 三维雷达反射率.
```
