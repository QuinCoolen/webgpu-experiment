# Lesson 17: Load the world around the camera

Prerequisite: [16: Chunks](16-terrain-chunks.md). Goal: explore beyond the initial nine chunks while keeping memory bounded.

## A moving neighborhood

Find the camera's chunk with `Math.floor(eye[0] / chunkSize)` and `Math.floor(eye[2] / chunkSize)`. Use floor rather than truncation: x = -0.1 belongs to chunk -1, not chunk 0.

Choose a load radius of 2 chunks and a retain radius of 3. The desired load set is the 5-by-5 square around the camera chunk. Retaining an extra ring avoids constantly unloading and reloading a chunk when the camera crosses a boundary; this difference is called **hysteresis**.

## Your update loop

Maintain a loaded `Map` and a pending collection of coordinates. When the camera enters another chunk:

1. Build the desired set of coordinate keys within the load radius.
2. Queue missing chunks, avoiding duplicate keys already loaded or queued. Prioritize nearest first.
3. Remove queued work that is no longer wanted.
4. Remove loaded chunks beyond the retain radius and release both their GPU buffers.

At the beginning of a frame, generate and upload at most one queued chunk. Use a small CPU budget, initially 4 ms measured with `performance.now()`, to decide whether to start more work. A single synchronous generation cannot be interrupted by that budget, so keep chunks small. It is fine to stay at one chunk per frame first.

Make membership changes before encoding the frame. Never destroy a buffer referenced by a command buffer you have recorded but not submitted. Previously submitted work can complete while the implementation handles destruction. Remove a chunk from future draw lists before calling `destroy()` on its buffers.

Reference: [GPUBuffer.destroy](https://developer.mozilla.org/en-US/docs/Web/API/GPUBuffer/destroy).

## Visible behavior

Render the chunks currently available while new ones arrive. Keep the camera slow enough that its neighborhood normally finishes loading. A loading edge is expected during initial construction; start the camera above the center and display pending count so the behavior is understandable.

Use a fixed seed and global coordinates so an unloaded chunk comes back exactly the same. Do not retain every generated typed array forever. With retain radius 3, the loaded square should contain no more than 49 chunks after each membership update.

Track loaded count, pending count, and the sum of buffer byte lengths. These are estimates of your data usage, not measurements of total driver VRAM consumption. Use a far plane of 200 so it contains the neighborhood; drawing fewer chunks does not itself change the projection.

## Check and troubleshoot

Walk ten chunks forward and then return. Geometry should reproduce and memory estimates should plateau. Cross x = 0 back and forth, then do the same at x = -16. Rapidly move or reset the camera: stale queued positions should be discarded rather than continuing to fill an abandoned area.

If creation freezes movement, lower cells per chunk or defer more work. A worker is a possible later improvement: send generation parameters, return typed arrays, and upload them on the rendering thread. Worker results need a generation/version identifier so stale results can be discarded. Moving code to a worker does not remove the need to bound the queue.

Explain: why are load and retain radii different? Why must generation be deterministic? Why can a frame budget fail to prevent a stall if one chunk is expensive?

Optional reference: [Worker message transfer](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage).

Next: [18: Visibility and detail](18-visibility-and-lod.md).
