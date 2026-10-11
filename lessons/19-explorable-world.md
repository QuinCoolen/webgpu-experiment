# Lesson 19: Build your first explorable world

Prerequisite: [18: Visibility and LOD](18-visibility-and-lod.md). Goal: turn the terrain experiments into a small, understandable world you can explore and explain.

## Define the finished experience

The world should have a stable seed, fly controls, lit textured terrain, bounded chunk loading, visibility filtering, and a way to reset the camera. This is a learning-scale open world generated around the camera. It does not yet promise unlimited travel, collision against every triangle, caves, or a production game engine.

Choose one visual identity: rolling grassland, dry hills, or snowy terrain. Keep the procedural geometry you understand and make a few deliberate changes to color, light direction, height amplitudes, and texture. Record the seed and parameters so the result is reproducible.

## 1. Bring the controls together

Add a compact page overlay with movement keys, reset, current seed, and a pause/resume button. Show camera coordinates, loaded/pending/drawn chunks, submitted triangles including skirts, estimated GPU buffer bytes, and a rolling frame interval average. Label frame interval as frame time; it is not a precise GPU execution measurement.

Make pause stop simulation and generation. Resuming must start one animation loop, not an additional loop on top of an existing one. Reset the previous-frame timestamp to avoid a time jump. Resetting the camera should update desired chunks before the next submission.

## 2. Add a ground-following option

Keep fly mode. For an optional walk mode, move horizontally and set camera y to `heightAt(eyeX, eyeZ) + 1.7`. Use horizontal forward/right vectors rather than pitch-dependent movement. State clearly in the UI that this follows the mathematical height function; it is not collision detection against triangles, and coarse LOD terrain can differ slightly from that surface.

Start movement slowly and prevent walking into an area whose chunk is not ready, or show an explicit loading state there. One choice is to check the proposed camera chunk against the loaded map before accepting horizontal movement. Walking should not expose holes just because generation is behind.

## 3. Handle resize and resource lifetime

Use a `ResizeObserver` to update canvas pixel dimensions from its CSS size and device pixel ratio, capped to a reasonable maximum and the device's `maxTextureDimension2D`. On a size change, recreate the depth texture and recalculate projection aspect. Clamp dimensions to at least 1.

Track a stopped flag and the animation-frame request ID. On page cleanup or deliberate restart, cancel the loop, remove event listeners, disconnect observers, and destroy owned buffers/textures. Handle `device.lost` by stopping rendering and showing a reload message. Full automatic device recovery is a separate project.

When seed or terrain parameters change, increment a world generation version, clear queued work, and release old chunks safely before starting the new world. Ignore results tagged with an older version if you later add asynchronous workers.

## 4. Do an exploration audit

Use this manual route:

1. Start at the same seed twice and compare the landmark hills.
2. Travel across positive and negative chunk coordinates and return.
3. Turn quickly at a chunk edge and inspect culling and seams.
4. Pause, switch tabs, resume, and check for a single smooth animation loop.
5. Resize the window and confirm aspect and depth still work.
6. Travel for several minutes: chunk counts and data-byte estimates should stay bounded.
7. Reset the camera or seed while work is pending. Check that stale terrain does not appear.

Document any visible LOD popping, skirt artifacts, loading gaps, and your current comfortable movement speed. Measure before expanding radii or resolution. More terrain is only useful if interaction remains responsive.

## Finish with an explanation

Write `WORLD-NOTES.md` containing controls, the seed and generation settings, a diagram of data flowing from height function to buffers to shaders, and three limitations you observed. Include one screenshot if you want a visual checkpoint.

Explain without reading the implementation: how do triangles reach the canvas? What data changes per vertex, per draw, and per frame? What keeps memory bounded? What work would you tackle next and why?

Possible future projects include worker generation, better LOD edge stitching, mipmaps, instanced vegetation, sky and fog, physics, voxel terrain, or GPU compute generation. Large travel distances also need a floating-origin or equivalent precision strategy. Pick one after this world is stable.

References: [Device loss](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/lost), [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver), [cancelAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame).
