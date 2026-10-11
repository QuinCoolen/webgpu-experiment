# Lesson 08: Rotation and matrices

Prerequisite: [07: Animation](07-animation.md). Goal: rotate the rectangle and understand how transforms compose.

## Begin with a visible rotation

A vector stores components such as x and y. Rotating a 2D point by angle `a` around the origin gives:

```text
newX = cos(a) * x - sin(a) * y
newY = sin(a) * x + cos(a) * y
```

Try a constant angle of pi/2 (90 degrees) in WGSL using `sin` and `cos`. Use a scaled rectangle with a visible color pattern. A point at `(1, 0)` should move to `(0, 1)`. Do not rotate only one corner; apply the formula to each incoming point. WGSL expects radians, where a full turn is about 6.283185.

## Package transforms in a matrix

A **matrix** is a grid of numbers representing a transformation. Multiplying it by a position applies that transformation. We use a 4-by-4 matrix to support translation, rotation, scale, and later perspective with one convention.

Install the math helper when you reach this lesson:

```sh
npm install wgpu-matrix@3.4.2
```

```js
import { mat4 } from 'wgpu-matrix';
```

This library provides WebGPU-compatible projection math. You will learn what the transformations mean without having to implement a matrix library.

Replace the 16-byte offset/scale uniform from lesson 06 with a **64-byte matrix uniform**:

```wgsl
struct Transform {
  matrix: mat4x4f,
}
@group(0) @binding(0) var<uniform> transform: Transform;
```

Use 16 floats in JavaScript. Recreate the uniform buffer and its bind group for the changed size. First upload `mat4.identity()`: the identity matrix leaves a position unchanged. Do not use `mat4.create()` with no arguments as an identity; it produces zeros.

In the vertex shader, construct `vec4f(point.x, point.y, 0.0, 1.0)` and multiply it on the left by `transform.matrix`. Remove the earlier offset/scale and handwritten rotation calculation once the matrix path is connected.

## Your experiment

The supplied API vocabulary is:

```js
mat4.translation([x, y, z]);
mat4.rotationZ(angleRadians);
mat4.scaling([xScale, yScale, zScale]);
mat4.multiply(a, b); // a * b
```

1. Upload identity and confirm the rectangle still appears.
2. Upload a Z rotation with angle `elapsedSeconds * 0.5` each frame.
3. Combine scale 0.4, rotation, and a translation of 0.4 to the right. Build `T * R * S` using nested calls to `multiply`.

With column-vector positions, the rightmost transform acts first: `T * R * S * position` scales, rotates, then translates. Swap T and R and observe the rectangle orbiting around the origin instead of spinning at its translated center. These two orders produce different results.

## Check and troubleshoot

The color pattern should rotate with the shape. If it disappears, check identity initialization, a 64-byte buffer, matrix-before-vector multiplication, and a rebuilt bind group. Keep the same per-frame upload and submission order as lesson 07.

Explain: why does transform order matter? What does identity do? What does w = 1 allow a translation matrix to do?

Reference: [wgpu-matrix documentation](https://wgpu-matrix.org/docs/). Its matrices use column-major storage; pass their returned arrays directly to the buffer upload without transposing.

Next: [09: A 3D cube](09-cube-and-depth.md).
