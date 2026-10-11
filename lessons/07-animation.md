# Lesson 07: Draw a new frame

Prerequisite: [06: Uniforms](06-uniforms.md). Goal: move the rectangle smoothly over time.

## One-time setup and repeated work

Animation draws a sequence of images. Keep the device, buffers, shader module, pipeline, and bind group in setup. Each frame updates a uniform and records new commands. Create the resources once and reuse them.

`requestAnimationFrame` asks the browser to call a function before a future repaint. The callback receives a timestamp in milliseconds. Use elapsed time so motion speed does not depend on how many frames a device manages to draw.

Use this scaffold inside `main`, after setup:

```js
let startTime;
let previousTime;

function frame(nowMs) {
  startTime ??= nowMs;
  previousTime ??= nowMs;
  const elapsedSeconds = (nowMs - startTime) / 1000;
  const deltaSeconds = Math.min((nowMs - previousTime) / 1000, 0.05);
  previousTime = nowMs;

  // TODO: update and upload the transform uniform.
  // TODO: record and submit this frame, using your existing pass code.

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
```

`deltaSeconds` measures time since the last frame, capped here to avoid a large jump after returning from a background tab. You will use it for camera controls later; the first experiment uses elapsed time instead.

## Your changes

1. Set both scale entries to 0.4. Set the x offset each frame to `Math.sin(elapsedSeconds) * 0.5`; leave y at zero. Sine smoothly moves between -1 and 1, so this offset stays between -0.5 and +0.5.
2. Upload the uniform before recording the frame.
3. Move the command encoder, pass descriptor, pass, and submission code into `frame`. Get a fresh `context.getCurrentTexture().createView()` there each frame. Finish and submit a new command buffer every time.
4. Keep the clear operation, all resource bindings, and indexed draw inside that pass. Remove the old one-time submission so there is only one path doing the drawing.

A command buffer can only be submitted once. The canvas's current texture also belongs to a particular frame. Reusing the pipeline is good; reusing either of those frame objects is not the intended workflow.

## Make failures visible

The existing `main().catch(...)` only catches errors during `main`. It does not catch exceptions inside later animation callbacks. If you add a `try/catch` around the frame body, report errors in the status element and stop scheduling new frames when one occurs. Do not silently continue a failing loop.

## Check and experiment

The rectangle should move left and right without leaving trails. Halve and double the number multiplying elapsed time inside `sin`; that changes speed. Change the final multiplier to alter travel distance. Try y motion as well.

If nothing moves, verify the upload is inside the callback. If the console says a command buffer was already submitted, create the encoder inside the callback. If it gets faster after edits, check that setup starts only one loop; reload the page to reset it.

Explain: which resources persist between frames? Why get the canvas texture again? Why does adding 0.01 per frame give different speeds on different displays?

Reference: [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).

Next: [08: Rotation and matrices](08-matrices.md).
