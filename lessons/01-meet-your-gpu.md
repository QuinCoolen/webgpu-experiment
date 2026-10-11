# Exercise 01: Meet your GPU

Goal: get a GPU device and print it in the browser console. No drawing yet.

## Three objects to understand

- **`navigator.gpu`** is the browser's entry point to WebGPU. It may be missing if WebGPU isn't available in this context.
- **An adapter** represents a GPU implementation the browser can offer, along with its capabilities. Requesting one can return `null`.
- **A device** is your connection to that implementation. Later, you will use it to create resources and submit work.

Think of this as opening a connection before using a service. Getting the device doesn't draw anything, just as creating a renderer doesn't automatically create a scene.

## Your task

Run `npm run dev`, open the printed URL, and open the browser console. In `src/main.js`, fill in `main()`:

1. Check `navigator.gpu`. If it is missing, throw an `Error` with a useful message.
2. Call `navigator.gpu.requestAdapter()` and store its result. This returns a Promise, so use `await`.
3. If the adapter is `null`, throw an error before proceeding.
4. Call `requestDevice()` on your adapter. This also returns a Promise.
5. Log the resulting device. Set `status.textContent` to a success message.

The existing `main().catch(...)` displays thrown errors, so you can concentrate on these steps.

You have finished when the console shows a `GPUDevice` and the page shows your success message without errors. A blank canvas is expected. If your browser cannot provide an adapter, keep the error message and we can diagnose the environment together.

## Before moving on

Try explaining these in your own words:

- How is the adapter different from the device?
- Why do the two requests need `await`?
- Why is the canvas still blank even though we have a device?

Tell the assistant you've made an attempt, and it can read your code directly from the project. There is no need to paste it into chat.

Reference if needed: [GPU.requestAdapter()](https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter) and [GPUAdapter.requestDevice()](https://developer.mozilla.org/en-US/docs/Web/API/GPUAdapter/requestDevice).
