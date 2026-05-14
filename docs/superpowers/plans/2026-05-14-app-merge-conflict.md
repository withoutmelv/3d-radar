# App Merge Conflict Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve `src/App.tsx` merge conflict markers while preserving the bottom map fix and current altitude-layer behavior.

**Architecture:** Resolve only the three conflict blocks in `src/App.tsx`. Keep the Leaflet `MapFloor` line from the stashed side, and collapse the two comment-only conflicts to the shared code value with concise existing comments.

**Tech Stack:** React 19, TypeScript, Vite, React Three Fiber, drei, Leaflet.

---

### Task 1: Resolve `src/App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [x] **Step 1: Confirm unresolved conflict markers**

Run:

```bash
rg -n "<<<<<<<|=======|>>>>>>>" src/App.tsx
```

Expected before the fix:

```text
src/App.tsx contains three conflict marker groups.
```

- [x] **Step 2: Keep the map floor inside `CoordinateSystem`**

Replace the conflict block inside the `CoordinateSystem` `<group>` with:

```tsx
      {/* 地面 */}
      <MapFloor />
```

- [x] **Step 3: Collapse the `targetY` conflict**

Replace the `focusCamera` conflict block with:

```tsx
    const targetY = index * 2 - 5 // 调整后的高度，去掉了 +1
```

- [x] **Step 4: Collapse the `RadarPlane` position conflict**

Replace the `position` conflict block in the image map with:

```tsx
            position={[4, index * 2, 4]} // 高度改为从 0 开始
```

- [x] **Step 5: Verify conflict markers are gone**

Run:

```bash
rg -n "<<<<<<<|=======|>>>>>>>" src/App.tsx
```

Expected after the fix:

```text
No output and exit code 1 from rg because no markers remain.
```

- [x] **Step 6: Run build verification**

Run:

```bash
npm run build
```

Expected:

```text
✓ built
```

The existing large chunk warning may remain.
