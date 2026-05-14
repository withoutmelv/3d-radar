# Map Follows Selected Height Spec

## Problem

The gray Guangdong map currently exists only in the coordinate system shown when no radar layer is selected. When a user selects a radar heatmap layer, the camera focuses on that layer and the coordinate system is hidden, so the map does not follow the selected layer.

## Desired Behavior

- Default state: the map stays at its current bottom position.
- Selected layer state: when the user selects a radar heatmap layer, the map moves to that selected layer's height and remains just below the heatmap as a contextual reference plane.
- Because the Leaflet map is a DOM surface, the map surface overlay image follows the current selection so the visible colored heatmap remains above the gray map at that height.
- Reset state: when the user deselects the layer or clicks reset, the map returns to the default bottom position with the full coordinate system.

## Design Decision

The map should move to the selected height, not merely switch the DOM overlay image. This matches the selected option: `地图移到该高度`.

## Current Context

- `MapFloor` is currently rendered inside `CoordinateSystem`, which is only visible when `selectedLayer === null`.
- Radar layer heights are `index === 0 ? 0.02 : index * 2` in local scene coordinates.
- Camera focus target is `targetY = index * 2 - 5`, accounting for the parent group offset of `[-4, -5, -4]`.
- `MapFloor` currently has a fixed local position `[4, -0.15, 4]`.

## Requirements

- Keep `MapFloor` visible in both default and selected states.
- When `selectedLayer === null`, keep the map at the current bottom position.
- When a layer is selected, place the map slightly below that selected layer:
  - Selected layer 0: map stays just below the 0km layer.
  - Selected layer N: map moves to just below `N * 2`.
- Preserve current Guangdong map center and grayscale map styling from `DESIGN.md`.
- Preserve existing camera focus behavior and radar layer spacing.
- Avoid adding new UI controls or changing visual tokens.

## Implementation Shape

- Give `MapFloor` a `height` prop, defaulting to `0`.
- Pass `overlayUrl` through `MapFloor` to `LeafletMapSurface`.
- Compute its local group position as `[4, height - 0.15, 4]`.
- Render `MapFloor` once from `SceneContent`, outside `CoordinateSystem`, using `height={selectedLayer === null ? 0 : selectedLayer * 2}` and `overlayUrl={selectedLayer === null ? images[0] : images[selectedLayer]}`.
- Remove `MapFloor` from `CoordinateSystem` so there is only one map instance.
- Keep `CoordinateSystem` responsible only for grid, axes, and altitude labels.

## Verification

- Static verification script confirms:
  - `MapFloor` accepts a `height` prop.
  - `MapFloor` uses `height - 0.15`.
  - `SceneContent` computes `mapHeight`.
  - `SceneContent` computes `mapOverlayUrl`.
  - `SceneContent` renders `<MapFloor height={mapHeight} />`.
  - `LeafletMapSurface` renders `overlayUrl`.
  - `CoordinateSystem` no longer renders `<MapFloor />`.
- `npm run build` must pass.
- Browser inspection should show the map still loads with Leaflet tiles and the map DOM remains present after selecting a layer.
