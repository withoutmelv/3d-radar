# Guangdong Gray Map 0km Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center the bottom map on Guangdong, use a grayscale map treatment, and render the 0km radar heatmap above the map floor.

**Architecture:** Keep the current `LeafletMapSurface`/`MapFloor` structure. Change the Leaflet view coordinates, adjust only the first radar layer's vertical offset/render relationship so it sits above the map, and apply grayscale styling only after the required `DESIGN.md` exists.

**Tech Stack:** React 19, TypeScript, Vite, React Three Fiber, drei, Leaflet.

---

### Task 1: Create Design Standard

**Files:**
- Create: `DESIGN.md`

- [x] **Step 1: Create root design spec**

Create `DESIGN.md` with the current dark radar workspace tokens and the map styling rule:

```markdown
Preferred grayscale treatment for Leaflet map tiles: `filter: grayscale(100%) saturate(0%) contrast(0.9) brightness(0.92)`.
```

### Task 2: Update Guangdong Map Center

**Files:**
- Modify: `src/App.tsx`

- [x] **Step 1: Change Leaflet center**

In `LeafletMapSurface`, replace:

```tsx
    }).setView([31.2304, 121.4737], 11)
```

with:

```tsx
    }).setView([23.3790, 113.7633], 8)
```

- [x] **Step 2: Verify build**

Run:

```bash
npm run build
```

Expected:

```text
✓ built
```

### Task 3: Put 0km Heatmap Above Map

**Files:**
- Modify: `src/App.tsx`

- [x] **Step 1: Add a tiny bottom-layer lift**

In `SceneContent`, replace:

```tsx
            position={[4, index * 2, 4]} // 高度改为从 0 开始
```

with:

```tsx
            position={[4, index === 0 ? 0.02 : index * 2, 4]}
```

- [x] **Step 2: Verify build**

Run:

```bash
npm run build
```

Expected:

```text
✓ built
```

### Task 4: Apply Grayscale Map From `DESIGN.md`

**Files:**
- Modify: `src/App.tsx`

- [x] **Step 1: Read `DESIGN.md`**

Run:

```bash
sed -n '1,260p' DESIGN.md
```

Expected:

```text
Design tokens and visual rules are available.
```

- [x] **Step 2: Apply only the permitted grayscale treatment**

Apply the exact permitted map filter to the Leaflet map surface style:

```tsx
filter: 'grayscale(100%) saturate(0%) contrast(0.9) brightness(0.92)'
```

- [x] **Step 3: Browser verification**

Run the dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Verify in the browser that:

```text
The map is centered on Guangdong.
The map is grayscale according to DESIGN.md.
The 0km radar image appears above the map plane.
```
