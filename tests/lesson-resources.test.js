import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCubeData } from '../lessons/support/cube.js';
import { checkerImage } from '../lessons/support/checker.js';
import { valueNoise2D } from '../lessons/support/noise.js';
import { extractFrustumPlanes, sphereIntersectsFrustum } from '../lessons/support/frustum.js';

const root = fileURLToPath(new URL('../', import.meta.url));

test('all 20 lesson guides and local Markdown links resolve', async () => {
  const lessonNames = (await readdir(resolve(root, 'lessons'))).filter((name) => /^\d.*\.md$/.test(name));
  assert.equal(lessonNames.length, 20);
  const files = ['README.md', 'AGENTS.md', 'lessons/support/README.md', ...lessonNames.map((name) => `lessons/${name}`)];
  for (const file of files) {
    const absolute = resolve(root, file);
    const content = await readFile(absolute, 'utf8');
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^[a-z]+:/i.test(target)) continue;
      await assert.doesNotReject(access(resolve(dirname(absolute), target)), `${file} -> ${target}`);
    }
  }
});

test('cube triangles face outward, share each face normal, and have valid UVs', () => {
  const { vertices, indices } = createCubeData();
  assert.equal(vertices.length, 24 * 12);
  assert.equal(indices.length, 36);
  assert.ok([...vertices].every(Number.isFinite));
  const position = (i) => [...vertices.slice(i * 12, i * 12 + 3)];
  for (let i = 0; i < indices.length; i += 3) {
    const ids = [...indices.slice(i, i + 3)];
    assert.ok(ids.every((id) => id < 24));
    const [a, b, c] = ids.map(position);
    const u = b.map((n, k) => n - a[k]);
    const v = c.map((n, k) => n - a[k]);
    const cross = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
    const normal = [...vertices.slice(ids[0] * 12 + 7, ids[0] * 12 + 10)];
    assert.ok(cross.reduce((sum, n, k) => sum + n * normal[k], 0) > 0);
    assert.equal(Math.hypot(...normal), 1);
    for (const id of ids) assert.deepEqual([...vertices.slice(id * 12 + 7, id * 12 + 10)], normal);
  }
  for (let i = 0; i < 24; i++) {
    assert.ok([...vertices.slice(i * 12 + 10, i * 12 + 12)].every((v) => v >= 0 && v <= 1));
  }
});

test('checker is opaque RGBA data with alternating neighboring texels', () => {
  const { pixels, width, height } = checkerImage;
  assert.equal(pixels.byteLength, width * height * 4);
  for (let i = 3; i < pixels.length; i += 4) assert.equal(pixels[i], 255);
  assert.notDeepEqual(pixels.slice(0, 4), pixels.slice(4, 8));
  assert.deepEqual(pixels.slice(0, 4), pixels.slice((width + 1) * 4, (width + 2) * 4));
});

test('noise is seeded, bounded, and continuous across positive and negative lattice edges', () => {
  for (let x = -4; x <= 4; x += 0.17) {
    for (let z = -4; z <= 4; z += 0.31) {
      const value = valueNoise2D(x, z, 1234);
      assert.ok(value >= -1 && value <= 1);
      assert.equal(valueNoise2D(x, z, 1234), value);
    }
  }
  assert.notEqual(valueNoise2D(0.3, -0.7, 1234), valueNoise2D(0.3, -0.7, 1235));
  for (const boundary of [-3, -1, 0, 1, 3]) {
    assert.ok(Math.abs(valueNoise2D(boundary - 1e-6, 0.37) - valueNoise2D(boundary + 1e-6, 0.37)) < 1e-5);
    assert.ok(Math.abs(valueNoise2D(0.37, boundary - 1e-6) - valueNoise2D(0.37, boundary + 1e-6)) < 1e-5);
  }
});

test('frustum uses WebGPU depth and retains spheres crossing a visible boundary', () => {
  // 90-degree vertical FOV, aspect 1, near 1, far 10; camera looks down -Z.
  const projection = [1,0,0,0, 0,1,0,0, 0,0,-10/9,-1, 0,0,-10/9,0];
  const planes = extractFrustumPlanes(projection);
  assert.equal(sphereIntersectsFrustum(planes, [0,0,-5], 0.1), true);
  for (const point of [[0,0,5], [0,0,-0.5], [0,0,-11], [7,0,-5], [-7,0,-5], [0,7,-5], [0,-7,-5]]) {
    assert.equal(sphereIntersectsFrustum(planes, point, 0.1), false, `outside: ${point}`);
  }
  assert.equal(sphereIntersectsFrustum(planes, [5.1,0,-5], 0.2), true);
  assert.equal(sphereIntersectsFrustum(planes, [0,0,-0.95], 0.1), true);
  // Translate camera to x=3: P*V changes column 3's x component to -3.
  const translated = [...projection];
  translated[12] = -3;
  assert.equal(sphereIntersectsFrustum(extractFrustumPlanes(translated), [3,0,-5], 0.1), true);
  assert.equal(sphereIntersectsFrustum(extractFrustumPlanes(translated), [-4,0,-5], 0.1), false);
});
