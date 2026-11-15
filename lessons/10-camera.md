# Lesson 10: Move a camera

Prerequisite: [09: Cube and depth](09-cube-and-depth.md). Goal: orbit and move around a cube that stays in place.

## Separate three transforms

The **model matrix** places an object in the world. The **view matrix** expresses the world relative to the camera. The **projection matrix** applies perspective. Their combined position transform is `projection * view * model`.

Remove lesson 09's translation that pushed the cube to z = -5. Put the cube at the world origin, initially with an identity model matrix. Instead, place the camera at `(0, 2, 5)` looking at `(0, 0, 0)`.

Think of the camera as an object with its own lesson 08 arrows: its right, up, and backward directions, plus its position as the origin. The view matrix is the **inverse** of that camera matrix. It undoes the camera's placement so the world is expressed relative to the camera.

Use `mat4.lookAt(eye, target, [0, 1, 0])` from wgpu-matrix to create the view matrix. This library's `lookAt` returns the view matrix already: do not invert it again. Upload `projection * view * model` to your matrix uniform. Keep depth testing and the frame loop.

## First experiment: orbit

Let angle increase with elapsed time. For radius 5, set camera x to `Math.sin(angle) * 5`, camera z to `Math.cos(angle) * 5`, and y to 2. Keep the target at the origin. The cube should stay centered while its visible faces change. Stop automatic orbiting before adding manual controls.

## Supplied keyboard tracking

Install these listeners once during setup, not every frame:

```js
const keys = new Set();
window.addEventListener('keydown', (event) => {
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
    event.preventDefault();
    keys.add(event.code);
  }
});
window.addEventListener('keyup', (event) => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());
```

For this playground the page owns keyboard input. If you later add text fields, ignore their key events so typing does not move the camera.

## Your camera controller

Maintain `eye`, `yaw`, and `pitch`. Start with `eye = [0, 2, 5]`, yaw 0, and pitch -0.25 radians. Use this convention:

```js
const forward = [
  Math.sin(yaw) * Math.cos(pitch),
  Math.sin(pitch),
  -Math.cos(yaw) * Math.cos(pitch),
];
const right = [Math.cos(yaw), 0, Math.sin(yaw)];
```

1. Left/right arrows decrease/increase yaw. Up/down arrows increase/decrease pitch. Multiply angular speed by `deltaSeconds`; clamp pitch between -1.4 and +1.4 radians.
2. W/S move along positive/negative `forward`; D/A move along positive/negative `right`; E/Q move along world up/down. Combine requested directions and normalize the total if nonzero, then multiply by speed (start with 3 world units per second) and `deltaSeconds`. This prevents diagonal movement being faster.
3. Set target to `eye + forward`. Recompute view and upload the combined matrix before drawing each frame.

Keep FOV 60 degrees, near 0.1, and far 100 for now. A camera pointing straight up can make its forward direction parallel to its up vector; the pitch clamp avoids that singular case.

## Check and troubleshoot

You should be able to circle the cube, approach it, and pass it. Releasing keys or switching windows should stop motion. The canvas stays 640 by 640 for now; lesson 19 handles resizing.

If the cube moves with the camera, check that only the view matrix uses camera position. If movement depends on refresh rate, use `deltaSeconds`. If looking left turns right, inspect the yaw signs against the supplied forward formula.

Explain: what changes when the camera moves but the cube does not? Why is the transform order `P * V * M`? What does normalization do to movement speed?

Reference: [wgpu-matrix lookAt](https://wgpu-matrix.org/docs/functions/mat4.lookAt.html).

Next: [11: Lighting](11-lighting.md).
