# Bottom Map Load Spec

## Problem

The bottom map area in the 3D radar comparison view is visible as an empty styled container, but Leaflet does not initialize and map tiles do not load.

## Evidence

- `npm run build` succeeds.
- Browser console has no map-related runtime errors.
- Leaflet CSS is requested successfully from `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`.
- Browser DOM contains one 800px map candidate div, but no `.leaflet-container`.
- Browser network panel shows no OpenStreetMap tile requests.
- Browser verification expression returned:

```json
{"pass":false,"leafletContainers":0,"tileImages":0,"mapCandidateDivs":1}
```

## Root Cause

`MapFloor` initializes Leaflet in a parent `useEffect`, but the DOM element with `ref={mapRef}` is rendered inside `@react-three/drei` `<Html>`. The installed drei `Html` component creates a separate React root and renders its children from a layout effect. In this timing, `MapFloor` can run its effect before the child DOM ref exists, so it skips initialization and never retries.

## Requirements

- Leaflet must initialize after the actual DOM container exists.
- The bottom map must produce one `.leaflet-container` and at least one `.leaflet-tile` image after page load.
- The existing map position, dimensions, interaction-disabled behavior, and visual parameters must remain unchanged.
- Do not add custom visual styling because project root `DESIGN.md` is missing.
- Keep the fix scoped to the map initialization lifecycle.

## Non-Goals

- Do not redesign the page layout.
- Do not change the radar layer heights or camera controls.
- Do not replace Leaflet or change tile provider.
