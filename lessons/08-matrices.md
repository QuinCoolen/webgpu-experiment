# Lesson 08: Matrices are arrows

Prerequisite: [07: Animation](07-animation.md). Goal: scale, rotate, and move the rectangle with one 4-by-4 matrix, and be able to read what any such matrix does.

In Three.js, every object has a `matrix` built from its `position`, `rotation`, and `scale`. In this lesson you build that matrix yourself, then hand the repetitive parts to a library.

Shader edits go in [src/shader.wgsl](../src/shader.wgsl). JavaScript goes in [src/main.js](../src/main.js).

## The one idea

A 4-by-4 transform matrix is **four arrows**, each stored as four numbers:

| Arrow | Meaning | Identity value |
| --- | --- | --- |
| 1st | Where the x axis points after the transform | `1, 0, 0, 0` |
| 2nd | Where the y axis points | `0, 1, 0, 0` |
| 3rd | Where the z axis points | `0, 0, 1, 0` |
| 4th | Where the origin `(0, 0, 0)` ends up | `0, 0, 0, 1` |

Multiplying the matrix by a position `(x, y, z, 1)` computes:

```text
x * (1st arrow) + y * (2nd arrow) + z * (3rd arrow) + 1 * (4th arrow)
```

In words: start at the new origin, then walk x steps along the new x axis, y steps along the new y axis, and z steps along the new z axis. Change the arrows and every vertex follows. The **identity** matrix keeps the original axes and origin, so nothing changes.

Why four numbers per arrow? The fourth slot, **w**, is what lets a matrix move things. Positions use w = 1, so the origin arrow gets added in full. Directions such as surface normals use w = 0, so they rotate and stretch but never move. The axes end in 0 and the origin ends in 1, which keeps a position's w at 1. Lesson 09's perspective is the one matrix that changes those fourth numbers.

## 1. Send a matrix instead of offset and scale

If your shader already multiplies by a `mat4x4f` uniform, check that an identity matrix draws the unchanged rectangle and skip to Part 2.

Replace the uniform struct in WGSL:

```wgsl
struct Transform {
  matrix: mat4x4f,
}
@group(0) @binding(0) var<uniform> transform: Transform;
```

In `vertexMain`, build the position with:

```wgsl
output.position = transform.matrix * vec4f(point.x, point.y, 0.0, 1.0);
```

In JavaScript, replace `transformData` with this identity matrix, written one arrow per line:

```js
// prettier-ignore
const matrixData = new Float32Array([
  1, 0, 0, 0, // x axis
  0, 1, 0, 0, // y axis
  0, 0, 1, 0, // z axis
  0, 0, 0, 1, // origin
]);
```

A `mat4x4f` holds 16 floats of 4 bytes each: **64 bytes**. Size the uniform buffer with `matrixData.byteLength`, upload `matrixData` once during setup, and remove the old offset and scale updates from `frame`. The bind group code is unchanged.

Expect the full-size, unmoving rectangle with red in the top left.

## 2. Edit the arrows by hand

Change numbers in `matrixData`, save, and look. Predict each result before saving. Restore the identity before the next experiment.

1. **Scale:** make the x axis `0.5, 0, 0, 0`. Each x step is now half as long, so the rectangle is half as wide. Then try the y axis as `0, 1.5, 0, 0`.
2. **Move:** make the origin `0.3, 0, 0, 1`. Every vertex starts from `(0.3, 0)`, so the rectangle shifts right.
3. **Slant:** make the y axis `0.5, 1, 0, 0`. Each step up now also drifts right, so the top edge slides right. Arrows do not have to stay at right angles.
4. **Quarter turn:** turn the rectangle 90 degrees counterclockwise. After the turn, which way does the x axis point? The y axis? Write both arrows, then predict where the red corner will land.

### How this array relates to a textbook

WebGPU stores a matrix one arrow after another. Math books draw each arrow as a vertical **column**, so the grid in a book is your array flipped across its diagonal. That is why this layout is called **column-major**:

```text
Your array, one arrow per line      The same matrix in a textbook
x axis:  a  b  c  d                 a  e  i  m
y axis:  e  f  g  h                 b  f  j  n
z axis:  i  j  k  l                 c  g  k  o
origin:  m  n  o  p                 d  h  l  p
```

Your array's lines are the book's columns. Three.js's `matrix.elements` uses the same order.

## 3. Any angle: sine and cosine

Angles in JavaScript and WGSL are measured in **radians**. A full turn is `2 * Math.PI`, about 6.283. A half turn is `Math.PI`, and a quarter turn is `Math.PI / 2`.

Take an arrow of length 1 pointing right, `(1, 0)`, and turn it counterclockwise by `angle`. Its tip travels around a circle and lands at `(cos(angle), sin(angle))`. That is the definition of cosine and sine.

Turning any arrow `(a, b)` a quarter turn counterclockwise gives `(-b, a)`; you did this in Part 2. The y axis is always the x axis turned a further quarter. So after rotating by `angle`:

```text
x axis = ( cos(angle), sin(angle))
y axis = (-sin(angle), cos(angle))
```

The z axis and origin stay put. This is called a rotation around the Z axis.

**Your task:** write `setRotationZ(matrix, angle)` above `main`. It writes the x and y numbers of the first two arrows, which are four entries in total, and leaves everything else as identity. The first arrow starts at index 0 and the second at index 4. Test `Math.PI / 2` against your answer from Part 2.

Then animate it. In `frame`, call `setRotationZ(matrixData, elapsedSeconds)` and then `device.queue.writeBuffer(uniformBuffer, 0, matrixData)` before recording the pass. Create `matrixData` once in setup. Each frame overwrites its numbers in JavaScript, and `writeBuffer` copies them to the GPU.

If you expand `x * (x axis) + y * (y axis)`, you get the formula found in most tutorials:

```text
newX = cos(angle) * x - sin(angle) * y
newY = sin(angle) * x + cos(angle) * y
```

It is the same calculation. The arrows are easier to remember.

## 4. Combine transforms with the library

Now make the rectangle smaller, spinning, and off to the right all at once. With arrows, you can still do it by hand: scale the rotated axes and set the origin. In `frame`, after `setRotationZ`, multiply entries 0, 1, 4, and 5 by 0.4, then set entry 12 to 0.4. That is a complete **model matrix**: the object's axes, with rotation and scale, plus its position.

Building this by hand stops scaling once a camera, perspective, or parent and child objects are added, or once you need to undo a matrix. Those need general matrix multiplication and inversion, which `wgpu-matrix` provides. Install it if you have not:

```sh
npm install wgpu-matrix@3.4.2
```

```js
import { mat4 } from "wgpu-matrix";

mat4.translation([x, y, z]); // moves the origin arrow
mat4.rotationZ(angle);       // your setRotationZ
mat4.scaling([sx, sy, sz]);  // stretches the axes
mat4.multiply(a, b);         // a * b: b's change happens first, then a's
```

Its arrays use the same arrow order as yours. `console.log(mat4.rotationZ(Math.PI / 2))` shows your quarter turn, with tiny values such as `6e-17` where you wrote 0. These are floating-point rounding.

**Your task:** build T, a translation of `(0.4, 0, 0)`; R, a rotation using elapsed time; and S, a scale of `(0.4, 0.4, 1)`. Combine them as `T * R * S` using nested `multiply` calls and upload the result each frame. Log it once: entries 0, 1, 4, and 5 hold the rotated axes times 0.4, and entry 12 is 0.4. These are the same numbers as your hand-built version.

Read `T * R * S * position` from right to left: **scale first, rotate second, move last**. Now swap to `R * T * S` and predict the result before saving. The rectangle is moved right first, then the moved rectangle is rotated around the canvas center, so it orbits. Order matters.

The shader did not change. JavaScript combines the matrices once per frame, and the GPU does one matrix multiply per vertex. You can delete `setRotationZ` now that `mat4.rotationZ` does the same job. Finish with `T * R * S` running in your frame loop. Lesson 09 builds on it.

## Check your understanding

- What do the four arrows of a matrix mean, and which array indices hold each one?
- Why does the origin arrow move a position (w = 1) but not a direction (w = 0)?
- Where do the textbook rotation formulas come from?
- In `T * R * S`, which change happens first? What happens when you swap T and R?
- What runs once per frame in JavaScript, and what runs once per vertex on the GPU?

## Troubleshooting

- **Rectangle vanished:** check that the identity has 1s at indices 0, 5, 10, and 15. Check that the buffer is 64 bytes and that the bind group is created after the new pipeline.
- **Rotates clockwise:** the minus sign is on the wrong `sin`.
- **Moved unexpectedly:** look for a leftover origin value at index 12 or 13, or old offset code.
- **Does not animate:** the matrix update and `writeBuffer` must both be inside `frame`.

References: [3Blue1Brown: Linear transformations and matrices](https://www.3blue1brown.com/lessons/linear-transformations) explains this same arrow view with animations (about 10 minutes). Also see [WebGPU matrix math](https://webgpufundamentals.org/webgpu/lessons/webgpu-matrix-math.html) and the [wgpu-matrix docs](https://wgpu-matrix.org/docs/). `mat4.identity()` makes an identity matrix; `mat4.create()` with no arguments makes all zeros.

Next: [09: A 3D cube](09-cube-and-depth.md).
