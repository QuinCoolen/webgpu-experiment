# Supplied lesson resources

These modules contain repetitive fixtures and small helpers, not completed lesson implementations. Import them from `src/main.js` or `src/terrain.js` using `../lessons/support/...` when the lesson introduces them.

| File | First lesson | Contents |
| --- | --- | --- |
| [cube.js](cube.js) | 09, again in 15b | Cube vertices, face colors, normals, UVs, and indices |
| [checker.js](checker.js) | 12 | A tiny RGBA checker image |
| [noise.js](noise.js) | 14 | Deterministic smooth value noise |
| [frustum.js](frustum.js) | 18 | WebGPU frustum-plane and sphere tests |

The cube and generated terrain share a 48-byte vertex format: position xyz at byte 0, color rgba at byte 12, normal xyz at byte 28, UV xy at byte 40.

Uniform progression: lesson 06 uses 16 bytes (offset xy, scale xy); lessons 08-10 use 64 bytes (one matrix); lessons 11 onward use 128 bytes (MVP matrix followed by normal matrix at byte 64). From lesson 15b, each object has its own 128-byte buffer and bind group; the terrain keeps one too. Recreate the associated buffer and bind group when changing the layout.

The math package `wgpu-matrix@3.4.2` is introduced in lesson 08 and is already installed in this playground.
