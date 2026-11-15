import { mat4 } from "wgpu-matrix";
import shaderCode from "./shader.wgsl?raw";
import "./style.css";

const canvas = document.querySelector("canvas");
const status = document.querySelector("#status");

async function main() {
  if (!navigator.gpu) {
    throw Error("No WebGPU");
  }

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw Error("No Adapter");
  }

  const device = await adapter.requestDevice();

  console.log(device);

  const context = canvas.getContext("webgpu");

  if (!context) {
    throw Error("No Context");
  }

  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({ device, format, alphaMode: "opaque" });

  // prettier-ignore
  const vertexData = new Float32Array([
    // x,    y,   r, g, b, a
    -0.6,  0.6,   1, 0, 0, 1, // 0: top left, red
    -0.6, -0.6,   0, 1, 0, 1, // 1: bottom left, green
     0.6, -0.6,   0, 0, 1, 1, // 2: bottom right, blue
     0.6,  0.6,   1, 1, 1, 1, // 3: top right, white
  ]);

  // prettier-ignore
  const indexData = new Uint16Array([
    0, 1, 2, // First triangle
    2, 3, 0, // Second triangle
  ]);

  // prettier-ignore
  const transformData = new Float32Array([
    0, 0, // offset x, y
    1, 1, // scale x, y
  ]);

  // prettier-ignore
  const matrixData = new Float32Array([
    1, 0, 0, 0, // First column
    0, 1, 0, 0, // Second column
    0, 0, 1, 0, // Third column
    0, 0, 0, 1, // Fourth column
  ]);

  const vertexBuffer = device.createBuffer({
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(vertexBuffer, 0, vertexData);

  const indexBuffer = device.createBuffer({
    size: indexData.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(indexBuffer, 0, indexData);

  const uniformBuffer = device.createBuffer({
    size: matrixData.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const movement = mat4.translation([0, 0, 0]);
  const rotation = mat4.rotationZ(Math.PI / 2);

  const combined = mat4.multiply(movement, rotation);
  device.queue.writeBuffer(uniformBuffer, 0, combined);

  const shaderModule = device.createShaderModule({ code: shaderCode });

  const renderPipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [
        {
          arrayStride: 24,
          stepMode: "vertex",
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: "float32x2",
            },
            {
              shaderLocation: 1,
              offset: 8,
              format: "float32x4",
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format,
        },
      ],
    },
  });

  const uniformBindGroup = device.createBindGroup({
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  let startTime;
  let previousTime;

  function frame(nowMs) {
    try {
      startTime ??= nowMs;
      previousTime ??= nowMs;

      const elapsedSeconds = (nowMs - startTime) / 1000;
      const deltaSeconds = Math.min((nowMs - previousTime) / 1000, 0.05);
      previousTime = nowMs;

      const rotation = mat4.rotationZ(elapsedSeconds * 0.5);

      const combined = mat4.multiply(movement, rotation);
      device.queue.writeBuffer(uniformBuffer, 0, combined);

      const encoder = device.createCommandEncoder();

      const renderPassDescriptor = {
        colorAttachments: [
          {
            clearValue: { r: 0.8, g: 0.3, b: 0.7, a: 1 },
            loadOp: "clear",
            storeOp: "store",
            view: context.getCurrentTexture().createView(),
          },
        ],
      };

      const pass = encoder.beginRenderPass(renderPassDescriptor);

      pass.setPipeline(renderPipeline);

      pass.setVertexBuffer(0, vertexBuffer);

      pass.setIndexBuffer(indexBuffer, "uint16");

      pass.setBindGroup(0, uniformBindGroup);

      pass.drawIndexed(indexData.length);

      pass.end();

      device.queue.submit([encoder.finish()]);

      requestAnimationFrame(frame);
    } catch (error) {
      console.error(error);
      status.textContent = error.message;
    }
  }

  requestAnimationFrame(frame);

  status.textContent =
    "Clear commands have been submitted, triangle has been drawn, triangles should be colored!";
}

main().catch((error) => {
  console.error(error);
  status.textContent = error.message;
});
