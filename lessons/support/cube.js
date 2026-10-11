// Supplied geometry for lessons 09-12; no WebGPU setup or rendering here.
// Vertex: position.xyz, color.rgba, normal.xyz, uv.xy (12 floats, 48 bytes).
export function createCubeData() {
  const faces = [
    { normal: [0, 0, 1], color: [1, 0.35, 0.25, 1], corners: [[-1,-1,1], [1,-1,1], [1,1,1], [-1,1,1]] },
    { normal: [0, 0,-1], color: [0.3, 0.7, 1, 1], corners: [[1,-1,-1], [-1,-1,-1], [-1,1,-1], [1,1,-1]] },
    { normal: [1, 0, 0], color: [0.4, 1, 0.4, 1], corners: [[1,-1,1], [1,-1,-1], [1,1,-1], [1,1,1]] },
    { normal: [-1,0, 0], color: [1, 0.8, 0.3, 1], corners: [[-1,-1,-1], [-1,-1,1], [-1,1,1], [-1,1,-1]] },
    { normal: [0, 1, 0], color: [0.8, 0.4, 1, 1], corners: [[-1,1,1], [1,1,1], [1,1,-1], [-1,1,-1]] },
    { normal: [0,-1, 0], color: [0.3, 1, 1, 1], corners: [[-1,-1,-1], [1,-1,-1], [1,-1,1], [-1,-1,1]] },
  ];
  const uv = [[0, 1], [1, 1], [1, 0], [0, 0]];
  const vertices = [];
  const indices = [];
  for (const face of faces) {
    const base = vertices.length / 12;
    face.corners.forEach((point, i) => vertices.push(...point, ...face.color, ...face.normal, ...uv[i]));
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };
}
