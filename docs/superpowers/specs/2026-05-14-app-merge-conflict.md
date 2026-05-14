# App Merge Conflict Spec

## Problem

`src/App.tsx` is in an unmerged state with conflict markers, so TypeScript/Vite cannot parse the application source.

## Evidence

- `git status --short --branch` reports `UU src/App.tsx`.
- `rg -n "<<<<<<<|=======|>>>>>>>" src/App.tsx` reports conflict markers at three areas:
  - `CoordinateSystem` ground rendering.
  - `focusCamera` `targetY` comment.
  - `RadarPlane` `position` comment.
- `git ls-files -u src/App.tsx` shows base, stage 2, and stage 3 entries.

## Root Cause

The conflict combines an upstream version that adjusted altitude behavior with stashed local changes that added the Leaflet-backed map floor. Two conflicts are semantically identical code with different comments, while the ground-rendering conflict must preserve `<MapFloor />` to keep the bottom map working.

## Requirements

- Remove all merge conflict markers from `src/App.tsx`.
- Preserve the Leaflet `MapFloor` rendering in `CoordinateSystem`.
- Preserve the existing six radar image layers and altitude spacing.
- Keep `targetY = index * 2 - 5` and `position={[4, index * 2, 4]}`.
- Do not introduce new visual design parameters; project root `DESIGN.md` is missing and this task is conflict resolution only.
- Verify with conflict-marker search and `npm run build`.

## Non-Goals

- Do not redesign the scene or UI.
- Do not change dependencies.
- Do not resolve unrelated modified files outside `src/App.tsx`.
