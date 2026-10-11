# Lesson 18: Draw less when it looks the same

Prerequisite: [17: Streaming](17-chunk-streaming.md). Goal: avoid drawing invisible chunks and use fewer triangles in the distance. Complete the two experiments separately.

## Part A: Frustum culling

The **view frustum** is the camera's visible volume between its near and far planes. **Culling** means skipping a draw that cannot contribute to the view. Keep this separate from unloading: a chunk behind you can stay in memory so turning around is immediate.

Use a bounding sphere around each chunk. For a chunk's XZ square, the center is its horizontal midpoint; y is the midpoint of the height bounds. Its radius is `Math.hypot(halfWidth, halfHeightRange, halfWidth)`. With lesson 14's amplitudes, height bounds are -5.25 to +5.25. If you change the height function or add skirts below, update the bounds so they include all vertices.

Import the supplied plane math from `src/main.js`:

```js
import { extractFrustumPlanes, sphereIntersectsFrustum } from '../lessons/support/frustum.js';
```

Once per frame, extract planes from the **projection-view matrix**, not a model-specific MVP. For each loaded chunk, call `sphereIntersectsFrustum(planes, center, radius)`. Draw it only when this returns true. The helper returns true for uncertain edge cases too: conservative tests may draw extra chunks but must not hide visible terrain.

The helper uses WebGPU's 0-to-w clip-depth convention. It is supplied so you can focus on the relationship between bounds, visibility, and draw calls rather than deriving six planes during this lesson.

Display loaded chunks and drawn chunks separately. Stand still and turn around: loaded count should stay stable, while drawn count changes. Chunks must not disappear early at screen edges or near the camera. If they do, disable culling, check bounds, and inspect whether the matrix uses the correct order.

## Part B: Level of detail (LOD)

LOD means using a simpler mesh where the extra detail is difficult to see. Keep chunk size 16, but generate 16, 8, or 4 cells per edge. These produce 512, 128, or 32 surface triangles per chunk.

Start with distance bands measured horizontally from camera to chunk center: under 24 units uses 16 cells, 24-48 uses 8, beyond 48 uses 4. Add hysteresis: crossing outward uses thresholds 28/52; coming inward uses 20/44. Store the current level per chunk to apply those distinct transitions.

Reuse the pending-work mechanism. Request a replacement mesh when a level changes; keep drawing the old one until its replacement is uploaded. Limit rebuilds per frame. Swap before recording a pass and release old buffers afterward. Include desired level and generation version in pending keys or records so obsolete results cannot replace newer choices.

## Handle mixed-resolution edges

Different resolutions sample different intermediate heights along a shared edge, so agreeing only at coarse vertices can leave cracks. For this first implementation, add **skirts**: strips extending downward from each mesh boundary to hide small gaps.

For each consecutive pair of edge vertices A,B, make lower copies C,D with y reduced by 8 units. Connect the upper and lower pair with two triangles, preserving the same vertex layout. Duplicate vertices for the skirt if you want separate side normals. Keep culling disabled while learning this technique, and include the skirts in index counts and bounds: the minimum y now extends to -13.25 for our height function. Eight units is a starting choice for these gentle hills; inspect gaps and adjust for the actual height range. Skirts hide gaps; they do not create a watertight terrain surface.

Use the same world-coordinate height, UV, and fixed-epsilon normal functions at every resolution. UV scales and light directions must not change with LOD.

## Check and reflect

Temporarily tint levels with different vertex colors and multiply texture RGB by vertex color to see the bands. Compare triangle counts with all chunks at 16 cells. Walk slowly across thresholds: switching should not thrash every frame. Inspect edges from low angles. A geometric pop when a mesh changes is expected; smooth morphing is a later extension.

Explain: how does culling differ from unloading? Why must bounds include terrain heights and skirts? Why does changing grid density leave visible cracks without an edge strategy?

Next: [19: An explorable world](19-explorable-world.md).
