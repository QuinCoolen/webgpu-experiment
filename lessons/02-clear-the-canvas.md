# Exercise 02: Clear the canvas

Goal: fill the canvas with a color using WebGPU. Keep your working device setup and add code after it in `src/main.js`.

## The idea

Before drawing a scene, a renderer often replaces the previous image with a background color. This is called **clearing**. Here, that will be our entire frame: one solid color, with no shapes or shaders yet.

Two things need to happen: choose where the GPU will write, then give it work to do.

For this exercise, a **texture** is an image stored in GPU memory. Textures can hold rendering output as well as images you put on models. The canvas supplies a texture that the browser can display.

A **command encoder** records instructions. A **render pass** is a section of those instructions that describes which images to render into and how to treat their contents. Finishing the encoder produces a **command buffer**, which you submit to the device's queue for execution.

The sequence is:

```text
Connect canvas to device
          |
Get the canvas texture to write into
          |
Record a render pass that clears it
          |
Finish recording and submit the commands
          |
Browser presents the result
```

## Part 1: Connect the canvas

1. Call `canvas.getContext("webgpu")` and store the context. Throw an error if it is `null`. The context connects this HTML canvas to WebGPU.
2. Get the format from `navigator.gpu.getPreferredCanvasFormat()`. A format describes how color values are stored in a texture; use the browser's choice for now.
3. Call `context.configure(...)` with an object containing your `device`, the `format`, and `alphaMode: "opaque"`. Opaque means the canvas will not appear transparent.

This sets up the destination. Your chosen background color comes in the next part.

Reference: [Configuring a canvas context](https://developer.mozilla.org/en-US/docs/Web/API/GPUCanvasContext/configure).

## Part 2: Record the clear

1. Create an encoder with `device.createCommandEncoder()`.
2. Get the canvas texture with `context.getCurrentTexture()`. Call `createView()` on that texture. A **view** describes how a texture is accessed; the default view is enough for this whole canvas image.
3. Call `encoder.beginRenderPass(...)` and store the returned pass. Pass an object with a `colorAttachments` array containing one object. A **color attachment** is an image destination for the pass's color output. Use these properties:

| Property | Value | Purpose |
| --- | --- | --- |
| `view` | Your texture view | Select the image to write into |
| `clearValue` | `{ r: 0.1, g: 0.3, b: 0.7, a: 1 }` | Choose the background color |
| `loadOp` | `"clear"` | Start by replacing the image contents with that color |
| `storeOp` | `"store"` | Keep the result after the pass ends |

For our canvas, use red, green, and blue values from 0 to 1. Alpha (`a`) describes opacity; keep it at 1 throughout this exercise.

4. Call `end()` on the pass. There are no draw calls in this exercise: the clear operation is enough to change the image.

Reference: [Beginning a render pass](https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass).

## Part 3: Submit the work

1. Call `finish()` on the encoder and store the command buffer.
2. Call `device.queue.submit(...)`, passing an **array** containing that command buffer.
3. Update the page status to something like "Clear commands submitted".

Recording commands does not execute them. Submitting hands the recorded work to the queue; returning from `submit()` does not mean the GPU has already finished. None of the calls in this lesson needs `await`. Keep texture acquisition, recording, and submission together, without introducing asynchronous waits between them.

Run this once when the page loads. An animation loop can come later.

Reference: [Submitting command buffers](https://developer.mozilla.org/en-US/docs/Web/API/GPUQueue/submit).

## Check and experiment

Run `npm run dev` if the server is not already running. Open the page and browser console. You are finished when the canvas shows your blue clear color and there are no WebGPU validation errors. Check the console even if the status shows success: GPU validation errors do not necessarily reach the JavaScript `.catch()` handler.

Then try these small experiments, predicting the result before saving:

1. Change the color to pure red, then yellow. Leave CSS unchanged so the result comes from your GPU commands.
2. Temporarily comment out the queue submission and reload. Does recording the pass alone show your chosen color? Restore submission afterward.

Before moving on, explain:

- What is the difference between a command encoder and a command buffer?
- What do `loadOp: "clear"` and `storeOp: "store"` each do?
- Why can this exercise produce an image without any shaders?

Tell me when you have an attempt ready, or where you get stuck. We can work through one part at a time.
