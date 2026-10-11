// Plane extraction for column-major WebGPU projection-view matrices.
// Each normalized plane [a,b,c,d] has its inside where ax+by+cz+d >= 0.
export function extractFrustumPlanes(m) {
  const rows = Array.from({ length: 4 }, (_, row) => [m[row], m[4 + row], m[8 + row], m[12 + row]]);
  const add = (a, b) => a.map((value, i) => value + b[i]);
  const subtract = (a, b) => a.map((value, i) => value - b[i]);
  const planes = [
    add(rows[3], rows[0]), subtract(rows[3], rows[0]),
    add(rows[3], rows[1]), subtract(rows[3], rows[1]),
    rows[2], subtract(rows[3], rows[2]),
  ];
  return planes.map((plane) => {
    const length = Math.hypot(plane[0], plane[1], plane[2]);
    if (!Number.isFinite(length) || length === 0) throw new Error('Expected a finite, nondegenerate projection-view matrix');
    return plane.map((value) => value / length);
  });
}

export function sphereIntersectsFrustum(planes, center, radius) {
  return planes.every(([a, b, c, d]) => a * center[0] + b * center[1] + c * center[2] + d >= -radius);
}
