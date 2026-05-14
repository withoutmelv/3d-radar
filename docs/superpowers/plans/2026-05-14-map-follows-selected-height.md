# Map Follows Selected Height Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the gray Guangdong map default to the bottom position, then move to the selected radar layer height when the user selects a heatmap layer.

**Architecture:** Keep one `MapFloor` instance owned by `SceneContent`, and pass it a computed `mapHeight` plus the active overlay URL. `CoordinateSystem` remains responsible for axes/grid only, so hiding it during selection no longer hides the map.

**Tech Stack:** React 19, TypeScript, Vite, React Three Fiber, drei, Leaflet.

---

### Task 1: Add Failing Static Verification

**Files:**
- Create: `scripts/verify-map-layer-switch.mjs`

- [x] **Step 1: Create verification script**

Create `scripts/verify-map-layer-switch.mjs`:

```javascript
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

const checks = [
  {
    name: 'MapFloor accepts a height prop',
    pass: /const MapFloor = \\(\\{\\s*height\\s*=\\s*0,\\s*overlayUrl\\s*\\}/s.test(source),
  },
  {
    name: 'MapFloor positions itself from height',
    pass: /position=\\{\\[4,\\s*height\\s*-\\s*0\\.15,\\s*4\\]\\}/.test(source),
  },
  {
    name: 'SceneContent computes mapHeight from selectedLayer',
    pass: /const mapHeight = selectedLayer === null \\? 0 : selectedLayer \\* 2/.test(source),
  },
  {
    name: 'SceneContent computes mapOverlayUrl from selectedLayer',
    pass: /const mapOverlayUrl = selectedLayer === null \\? images\\[0\\] : images\\[selectedLayer\\]/.test(source),
  },
  {
    name: 'SceneContent renders MapFloor with mapHeight',
    pass: /<MapFloor height=\\{mapHeight\\} overlayUrl=\\{mapOverlayUrl\\} \\/>/.test(source),
  },
  {
    name: 'LeafletMapSurface renders overlayUrl image',
    pass: /src=\\{overlayUrl\\}/.test(source),
  },
  {
    name: 'CoordinateSystem does not render MapFloor',
    pass: !/const CoordinateSystem[\\s\\S]*?<MapFloor\\s*\\/>[\\s\\S]*?const RadarPlane/.test(source),
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
node scripts/verify-map-layer-switch.mjs
```

Expected before implementation:

```text
FAIL MapFloor accepts a height prop
FAIL MapFloor positions itself from height
FAIL SceneContent computes mapHeight from selectedLayer
FAIL SceneContent computes mapOverlayUrl from selectedLayer
FAIL SceneContent renders MapFloor with mapHeight
FAIL LeafletMapSurface renders overlayUrl image
FAIL CoordinateSystem does not render MapFloor
```

### Task 2: Move Map Ownership To SceneContent

**Files:**
- Modify: `src/App.tsx`

- [x] **Step 1: Add height and overlay props to MapFloor**

Replace:

```tsx
const MapFloor = () => {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[4, -0.15, 4]}>
```

with:

```tsx
const MapFloor = ({ height = 0, overlayUrl }: { height?: number; overlayUrl: string }) => {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[4, height - 0.15, 4]}>
```

- [x] **Step 2: Pass overlayUrl into LeafletMapSurface**

Replace:

```tsx
const LeafletMapSurface = () => {
```

with:

```tsx
const LeafletMapSurface = ({ overlayUrl }: { overlayUrl: string }) => {
```

Then replace the overlay image source with:

```tsx
src={overlayUrl}
```

- [x] **Step 3: Remove MapFloor from CoordinateSystem**

In `CoordinateSystem`, remove:

```tsx
      {/* 地面 */}
      <MapFloor />
```

- [x] **Step 4: Compute mapHeight and mapOverlayUrl in SceneContent**

After `const images = [...]`, add:

```tsx
  const mapHeight = selectedLayer === null ? 0 : selectedLayer * 2
  const mapOverlayUrl = selectedLayer === null ? images[0] : images[selectedLayer]
```

- [x] **Step 5: Render MapFloor from SceneContent**

In `SceneContent` return, replace:

```tsx
    <group position={[-4, -5, -4]}>
      <CoordinateSystem visible={selectedLayer === null} />
      <group>
```

with:

```tsx
    <group position={[-4, -5, -4]}>
      <MapFloor height={mapHeight} overlayUrl={mapOverlayUrl} />
      <CoordinateSystem visible={selectedLayer === null} />
      <group>
```

### Task 3: Verify

**Files:**
- Test: `scripts/verify-map-layer-switch.mjs`

- [x] **Step 1: Run static verification**

Run:

```bash
node scripts/verify-map-layer-switch.mjs
```

Expected after implementation:

```text
PASS MapFloor accepts a height prop
PASS MapFloor positions itself from height
PASS SceneContent computes mapHeight from selectedLayer
PASS SceneContent computes mapOverlayUrl from selectedLayer
PASS SceneContent renders MapFloor with mapHeight
PASS LeafletMapSurface renders overlayUrl image
PASS CoordinateSystem does not render MapFloor
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
Default state: one Leaflet map is visible at the bottom.
After selecting a radar layer: one Leaflet map remains present and moves with the selected layer focus.
Reset: map returns to the bottom with axes/grid visible.
```
