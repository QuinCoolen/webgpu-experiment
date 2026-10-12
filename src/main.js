import "./style.css";

const canvas = document.querySelector("canvas");
const status = document.querySelector("#status");

async function main() {
  // Exercise 01 complete: request access to the GPU.

  if (!navigator.gpu) {
    throw Error("No WebGPU");
  }

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw Error("No Adapter");
  }

  const device = await adapter.requestDevice();

  console.log(device);

  // Exercise 02 complete: configure the canvas and submit a clear pass.

  // E2: Part 1

  const context = canvas.getContext("webgpu");

  if (!context) {
    throw Error("No Context");
  }

  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({ device, format, alphaMode: "opaque" });

  // Completed through lesson 06: indexed geometry and transform uniforms.
  // Next: lessons/07-animation.md (not started yet).

  const vertexData = new Float32Array([
    // x,    y,   r, g, b, a
    -0.6,
    0.6,
    1,
    0,
    0,
    1, // 0: top left, red
    -0.6,
    -0.6,
    0,
    1,
    0,
    1, // 1: bottom left, green
    0.6,
    -0.6,
    0,
    0,
    1,
    1, // 2: bottom right, blue
    0.6,
    0.6,
    1,
    1,
    1,
    1, // 3: top right, white
  ]);

  const indexData = new Uint16Array([
    0,
    1,
    2, // First triangle
    2,
    3,
    0, // Second triangle
  ]);

  const transformData = new Float32Array([
    0,
    0, // offset x, y
    1,
    1, // scale x, y
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
    size: transformData.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(uniformBuffer, 0, transformData);

  const shaderCode = `
  struct Transform {
    offset: vec2f,
    scale: vec2f,
  }
  @group(0) @binding(0) var<uniform> transform: Transform;

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
  }

  @vertex
  fn vertexMain(
    @location(0) point: vec2f,
    @location(1) color: vec4f
  ) -> VertexOutput {
    var output: VertexOutput;

    let movedPoint = point * transform.scale + transform.offset;

    output.position = vec4f(movedPoint.x, movedPoint.y, 0.0, 1.0);
    output.color = color;

    return output;
  }

  @fragment
  fn fragmentMain(@location(0) color: vec4f) -> @location(0) vec4f {
    return color;
  }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  const renderPipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
      // Each vertex contains two position floats and four color floats.
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

  // E2: Part 2

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

  // Six indices select four shared vertices to form two triangles.

  pass.setPipeline(renderPipeline);

  pass.setVertexBuffer(0, vertexBuffer);

  pass.setIndexBuffer(indexBuffer, "uint16");

  pass.setBindGroup(0, uniformBindGroup);

  pass.drawIndexed(indexData.length);

  pass.end();

  // E2: Part 3

  device.queue.submit([encoder.finish()]);
  status.textContent =
    "Clear commands have been submitted, triangle has been drawn, triangles should be colored!";
}

// This handles errors from your async function and makes them visible on the page.
main().catch((error) => {
  console.error(error);
  status.textContent = error.message;
});
