struct Transform {
  matrix: mat4x4f,
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

  output.position = transform.matrix * vec4f(point.x, point.y, 0.0, 1.0);

  output.color = color;

  return output;
}

@fragment
fn fragmentMain(@location(0) color: vec4f) -> @location(0) vec4f {
  return color;
}
