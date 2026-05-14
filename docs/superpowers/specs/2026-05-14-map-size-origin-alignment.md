# Map Size Origin Alignment Spec

## Problem

The Leaflet map is rendered too large compared with the radar PNG heatmap plane. The map should align with the coordinate-system origin corner and match the rendered heatmap footprint.

## Current Context

- Radar heatmaps render as `8 x 8` Three.js planes centered at `[4, layerHeight, 4]`.
- That footprint makes the radar plane's corner align to the coordinate origin.
- `MapFloor` is also centered at `[4, height - 0.15, 4]`, but its `<Html>` DOM surface is `800px x 800px`, which maps to a much larger world footprint than the `8 x 8` heatmap plane.
- The current backing plane is `8.2 x 8.2`, larger than the heatmap footprint.

## Requirements

- Keep the map center at `[4, height - 0.15, 4]` so the map footprint corner aligns with the coordinate origin.
- Resize the Leaflet map DOM surface to match the rendered `8 x 8` PNG heatmap footprint.
- Keep the map and overlay image the same rendered size.
- Keep the current Guangdong center, grayscale map styling, and layer-follow behavior.
- Do not change radar layer spacing, camera behavior, or layer controls.

## Design Standard Update

`DESIGN.md` must define the fixed map floor size:

- Map floor world footprint: `8 x 8`.
- drei `Html` `distanceFactor`: `10`.
- Leaflet DOM surface size: `320px x 320px`.
- CSS box sizing: `border-box`.

## Implementation Shape

- Add `MAP_SURFACE_SIZE_PX = 320`.
- Use `${MAP_SURFACE_SIZE_PX}px` for the Leaflet map surface width and height.
- Add `boxSizing: 'border-box'` to the map surface so the border is included in the intended rendered size.
- Change the backing plane from `8.2 x 8.2` to `8 x 8`.

## Verification

- Static verification script confirms the map surface size, border-box sizing, `8 x 8` backing plane, and `distanceFactor={10}`.
- `npm run build` must pass.
- Browser inspection should show the Leaflet surface is styled as `320px x 320px` and the overlay image remains `100% x 100%` of that surface.
