# Map Size Origin Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resize the Leaflet map so its rendered footprint matches the radar PNG heatmap footprint and remains aligned to the coordinate origin corner.

**Architecture:** Keep the existing 3D center position `[4, height - 0.15, 4]`, because a centered `8 x 8` plane aligns its corner to the origin. Reduce the `<Html>` map surface from `800px` to `320px`, which maps to the same `8 x 8` footprint at `distanceFactor={10}`, and make the backing plane exactly `8 x 8`.

**Tech Stack:** React 19, TypeScript, Vite, React Three Fiber, drei, Leaflet.

---

### Task 1: Add Failing Verification

**Files:**
- Create: `scripts/verify-map-size-alignment.mjs`

- [x] **Step 1: Create verification script**

Create `scripts/verify-map-size-alignment.mjs`:

```javascript
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const design = readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8')
const mapFloorBlock = source.match(/const MapFloor[\s\S]*?const CoordinateSystem/)?.[0] ?? ''

const checks = [
  {
    name: 'Design standard documents 320px map surface',
    pass: /320px x 320px/.test(design),
  },
  {
    name: 'Map surface size constant is 320',
    pass: /const MAP_SURFACE_SIZE_PX = 320/.test(source),
  },
  {
    name: 'Map surface width uses MAP_SURFACE_SIZE_PX',
    pass: /width: `\\$\\{MAP_SURFACE_SIZE_PX\\}px`/.test(source),
  },
  {
    name: 'Map surface height uses MAP_SURFACE_SIZE_PX',
    pass: /height: `\\$\\{MAP_SURFACE_SIZE_PX\\}px`/.test(source),
  },
  {
    name: 'Map surface uses border-box sizing',
    pass: /boxSizing: 'border-box'/.test(source),
  },
  {
    name: 'Map backing plane is exactly 8 by 8',
    pass: /<planeGeometry args=\\{\\[8, 8\\]\\} \\/>/.test(mapFloorBlock),
  },
  {
    name: 'Map Html keeps distanceFactor 10',
    pass: /distanceFactor=\\{10\\}/.test(source),
  },
  {
    name: 'Map stays centered for origin-corner alignment',
    pass: /position=\\{\\[4, height - 0\\.15, 4\\]\\}/.test(source),
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
node scripts/verify-map-size-alignment.mjs
```

Expected before implementation:

```text
FAIL Design standard documents 320px map surface
FAIL Map surface size constant is 320
FAIL Map surface width uses MAP_SURFACE_SIZE_PX
FAIL Map surface height uses MAP_SURFACE_SIZE_PX
FAIL Map surface uses border-box sizing
FAIL Map backing plane is exactly 8 by 8
PASS Map Html keeps distanceFactor 10
PASS Map stays centered for origin-corner alignment
```

### Task 2: Update Design Standard

**Files:**
- Modify: `DESIGN.md`

- [x] **Step 1: Add map sizing rule**

In `DESIGN.md` under `Map Styling`, add:

```markdown
- Map floor world footprint is `8 x 8`, centered at `[4, height, 4]` so its origin-facing corner aligns with the coordinate origin.
- With drei `Html` `distanceFactor={10}`, the Leaflet DOM surface must be `320px x 320px` and use `box-sizing: border-box`.
```

### Task 3: Resize And Align Map Surface

**Files:**
- Modify: `src/App.tsx`

- [x] **Step 1: Add map size constant**

Add after `RADAR_IMAGES`:

```tsx
const MAP_SURFACE_SIZE_PX = 320
```

- [x] **Step 2: Use the map size constant**

Replace the map surface styles:

```tsx
        width: '800px',
        height: '800px',
```

with:

```tsx
        width: `${MAP_SURFACE_SIZE_PX}px`,
        height: `${MAP_SURFACE_SIZE_PX}px`,
```

- [x] **Step 3: Include border in the fixed surface size**

Add to the same style object:

```tsx
        boxSizing: 'border-box',
```

- [x] **Step 4: Match backing plane to radar footprint**

Replace:

```tsx
        <planeGeometry args={[8.2, 8.2]} />
```

with:

```tsx
        <planeGeometry args={[8, 8]} />
```

### Task 4: Verify

**Files:**
- Test: `scripts/verify-map-size-alignment.mjs`

- [x] **Step 1: Run static verification**

Run:

```bash
node scripts/verify-map-size-alignment.mjs
```

Expected:

```text
PASS Design standard documents 320px map surface
PASS Map surface size constant is 320
PASS Map surface width uses MAP_SURFACE_SIZE_PX
PASS Map surface height uses MAP_SURFACE_SIZE_PX
PASS Map surface uses border-box sizing
PASS Map backing plane is exactly 8 by 8
PASS Map Html keeps distanceFactor 10
PASS Map stays centered for origin-corner alignment
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
The Leaflet map surface computed style is 320px by 320px.
The overlay image is 100% by 100% of the map surface.
The map remains loaded with one Leaflet container and tile images.
```
