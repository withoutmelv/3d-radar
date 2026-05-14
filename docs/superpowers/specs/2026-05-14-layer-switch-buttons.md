# Layer Switch Buttons Spec

## Problem

Users can currently switch radar layers only by clicking the 3D heatmap planes. This is imprecise because the layers overlap in perspective and some layers may be hard to hit directly.

## Desired Behavior

- Add visible page controls for switching radar height layers.
- Controls must include:
  - `全览` for clearing the selected layer.
  - `0 km` through `5 km` for selecting each radar layer.
- Clicking a layer button updates `selectedLayer`.
- Existing behavior must remain:
  - Camera focuses on the selected layer.
  - The map follows the selected layer height.
  - The map overlay image switches to the selected layer.
  - `全览` returns to the default overview and bottom map.

## Design Standard

The control must follow `DESIGN.md`:

- Use the current dark operational UI.
- Use `#00ffff` for active/selected state.
- Use `rgba(11, 20, 36, 0.8)` for the panel surface.
- Use `rgba(255, 255, 255, 0.1)` for subtle borders.
- Use `4px` border radius.
- Use `8px 16px` button padding.
- Do not add gradients, shadows, or decorative effects.

## Implementation Shape

- Move the radar image list to a top-level `RADAR_IMAGES` constant so scene rendering and layer controls share one source of truth.
- Add a `LayerControls` component near the top-level UI components.
- Render `LayerControls` from `App` above the canvas.
- Remove the old conditional `重置视图` button because `全览` replaces that action and avoids overlapping controls.

## Verification

- Static script confirms the layer controls exist and use shared radar image data.
- `npm run build` must pass.
- Browser check confirms:
  - `全览`, `0 km`, and `5 km` buttons exist.
  - Clicking `3 km` shows `高度 3 km 详情`.
  - Clicking `全览` returns to `三维雷达反射率`.
