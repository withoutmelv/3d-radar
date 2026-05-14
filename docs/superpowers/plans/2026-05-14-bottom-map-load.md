# Bottom Map Load Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the bottom Leaflet map initialize reliably inside the drei `Html` portal and load map tiles.

**Architecture:** Move Leaflet initialization into a small component rendered inside `<Html>`, so its effect runs in the same React root that owns the DOM node. Preserve the existing map container style and map options, and verify through browser DOM/network state rather than adding a new test framework.

**Tech Stack:** React 19, Vite 8, TypeScript, `@react-three/drei` `Html`, Leaflet 1.9.

---

### Task 1: Repair Leaflet Initialization Lifecycle

**Files:**
- Modify: `src/App.tsx`
- Test: browser verification against `http://127.0.0.1:5173/`

- [x] **Step 1: Confirm the failing browser assertion**

Run the app with:

```bash
npm run dev -- --host 127.0.0.1
```

In the browser console, run:

```javascript
(() => {
  const containers = document.querySelectorAll('.leaflet-container')
  const tiles = document.querySelectorAll('img.leaflet-tile')
  return {
    pass: containers.length === 1 && tiles.length > 0,
    leafletContainers: containers.length,
    tileImages: tiles.length,
    mapCandidateDivs: [...document.querySelectorAll('div')]
      .filter((el) => el.getAttribute('style')?.includes('800px')).length,
  }
})()
```

Expected before the fix:

```json
{"pass":false,"leafletContainers":0,"tileImages":0,"mapCandidateDivs":1}
```

- [x] **Step 2: Replace parent-owned map ref lifecycle with an Html-child component**

In `src/App.tsx`, replace the current `MapFloor` implementation with:

```tsx
const LeafletMapSurface = () => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = mapRef.current
    if (!element) return

    const map = L.map(element, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      touchZoom: false,
      fadeAnimation: false,
    }).setView([31.2304, 121.4737], 11)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(element)

    const frameId = requestAnimationFrame(() => {
      map.invalidateSize()
    })

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      map.remove()
    }
  }, [])

  return (
    <div
      ref={mapRef}
      style={{
        width: '800px',
        height: '800px',
        background: '#0b1424',
        border: '2px solid #1e2d45',
        borderRadius: '4px',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    />
  )
}

const MapFloor = () => {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[4, -0.15, 4]}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[8.2, 8.2]} />
        <meshBasicMaterial color="#0b1424" />
      </mesh>

      <Html
        transform
        distanceFactor={10}
        occlude={false}
        portal={{ current: document.body }}
      >
        <LeafletMapSurface />
      </Html>
    </group>
  )
}
```

- [x] **Step 3: Run build verification**

Run:

```bash
npm run build
```

Expected:

```text
✓ built
```

The Vite chunk-size warning may remain; it is unrelated to this fix.

- [x] **Step 4: Verify browser map initialization**

With the dev server running, reload `http://127.0.0.1:5173/` and run the same browser assertion from Step 1.

Expected after the fix:

```json
{"pass":true,"leafletContainers":1}
```

`tileImages` must be greater than `0`.

- [x] **Step 5: Verify there are no map runtime errors**

Check browser console messages.

Expected:

```text
No Leaflet initialization errors.
```

Existing non-map warnings such as `THREE.Clock` deprecation can remain.
