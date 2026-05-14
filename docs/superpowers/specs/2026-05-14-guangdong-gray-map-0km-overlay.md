# Guangdong Gray Map 0km Overlay Spec

## Problem

The bottom map currently centers on Shanghai and the 0km radar heatmap does not reliably appear visually above the map floor. The requested behavior is:

- Center the bottom map on Guangdong.
- Use a grayscale map appearance.
- Render the 0km heatmap above the map.

## Current Context

- The map is implemented in `src/App.tsx` by `LeafletMapSurface`, rendered through `MapFloor` inside drei `<Html>`.
- The current Leaflet view is Shanghai: `[31.2304, 121.4737]`.
- Radar layers are rendered by `RadarPlane`; the 0km layer is `images[0]` at `position={[4, 0, 4]}` inside `SceneContent`'s parent group `position={[-4, -5, -4]}`.
- `RadarPlane` currently uses `depthTest={true}` and `depthWrite={false}`.
- Project root `DESIGN.md` was missing; user approved creating it for this task.

## Requirements

- Change Leaflet `setView` to Guangdong Province center coordinates.
- Keep the existing Leaflet initialization lifecycle that fixes the previous map loading issue.
- Ensure the 0km heatmap plane renders above the bottom map surface.
- Keep the existing radar layer spacing and six image layers.
- Do not change unrelated UI controls or camera behavior.
- Implement grayscale styling only through the root `DESIGN.md` map styling rule.

## Proposed Technical Direction

- Use Guangdong center coordinates `[23.3790, 113.7633]` with the existing zoom level unless `DESIGN.md` requires a different map scale.
- Lift only the 0km radar plane slightly above the map DOM surface to avoid z-fighting/occlusion with the Leaflet `<Html>` plane.
- Apply grayscale through the Leaflet surface styling permitted by `DESIGN.md`.

## Design Standard

The root `DESIGN.md` defines the grayscale map treatment as `filter: grayscale(100%) saturate(0%) contrast(0.9) brightness(0.92)`.

## Non-Goals

- Do not replace Leaflet.
- Do not change tile provider unless required by `DESIGN.md`.
- Do not redesign the page layout.
- Do not refactor `src/App.tsx` beyond the requested map/layer behavior.
