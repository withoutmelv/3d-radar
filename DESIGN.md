# 3D Radar Visualization Design Standard

## Visual Thesis

Operational 3D radar analysis UI with a dark aviation-style workspace, restrained cyan interaction states, gray cartographic context, and high-contrast radar overlays.

## Color Tokens

- App background: `#0b1424`
- Deep surface: `rgba(11, 20, 36, 0.8)`
- Ground backing: `#0b1424`
- Grid section line: `#1e2d45`
- Grid cell line: `#121a2b`
- Primary text: `#ffffff`
- Secondary text: `rgba(255, 255, 255, 0.87)`
- Subtle border: `rgba(255, 255, 255, 0.1)`
- Accent cyan: `#00ffff`
- Axis X: `#ff4d4d`
- Axis Y: `#4dff4d`
- Axis Z: `#4d4dff`

## Typography

- Use the existing system stack: `Inter, system-ui, Avenir, Helvetica, Arial, sans-serif`.
- UI labels: `12px`.
- Compact section labels: `14px`.
- Scene title: `28px`, bold.
- Do not scale font size with viewport width.
- Letter spacing must remain `0`.

## Spacing

- Overlay panel offset: `40px` from viewport edge.
- Overlay panel padding: `15px`.
- Legend swatch size: `15px` by `10px`.
- Compact row gap: `2px`.
- Control button padding: `8px 16px`.

## Shape And Borders

- Standard radius: `4px`.
- Subtle UI border: `1px solid rgba(255, 255, 255, 0.1)`.
- Accent control border: `1px solid #00ffff`.
- Map floor border: `2px solid #1e2d45`.
- Do not introduce rounded corners above `4px`.

## Map Styling

- Bottom map must use grayscale cartographic context so radar colors remain dominant.
- Preferred grayscale treatment for Leaflet map tiles: `filter: grayscale(100%) saturate(0%) contrast(0.9) brightness(0.92)`.
- Keep map interaction disabled when it is used as the 3D ground context.
- Keep map background and pre-load backing at `#0b1424`.
- Map floor world footprint is `8 x 8`, horizontally centered at `[4, *, 4]` so its origin-facing corner aligns with the coordinate origin.
- With drei `Html` `distanceFactor={10}`, the Leaflet DOM surface must be `320px x 320px` and use `box-sizing: border-box`.

## 3D Layering

- The map is the ground context layer.
- The 0km radar heatmap must render above the map plane.
- Radar overlays keep their original color palette and transparency behavior.
- Avoid decorative gradients, orbs, shadows, or extra panels.

## Responsive Rules

- The app remains full viewport: root and app container use `100%` width and `100vh` height.
- Preserve stable fixed-format dimensions for the map floor and radar planes.
- Do not add mobile-specific typography scaling unless required by a future spec.
