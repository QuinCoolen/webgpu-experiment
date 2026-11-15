# Lesson 11: Light a surface

Prerequisite: [10: Camera](10-camera.md). Goal: brighten faces pointing toward a light and darken faces pointing away.

## A surface has a direction

A **normal** is a vector perpendicular to a surface. The cube helper already provides one per vertex. A unit normal has length 1. The **dot product** measures alignment: for two unit vectors it is 1 when they point the same way, 0 at right angles, and -1 when opposed.

We will use a simple diffuse model, `max(dot(normal, directionToLight), 0)`, plus a small constant ambient term so unlit faces remain visible. This teaches directional lighting, not cast shadows or physically complete materials.

## 1. Bring normals into the shader

Add a vertex attribute with `shaderLocation: 2`, `offset: 28`, and `format: "float32x3"`. The stride remains 48 bytes. Add `@location(2) normal: vec3f` to the vertex function input.

In `VertexOutput`, add a normal field at output location 1. Fragment input location 1 should receive a `vec3f`. Color remains at output/input location 0. Input and output locations belong to different interfaces.

Begin with an identity model matrix. In that case the supplied normals already point in world directions, so pass them through and normalize them again in the fragment shader. Interpolation can change a vector's length.

## 2. Calculate light

Use a fixed world-space direction toward the light, `normalize(vec3f(0.5, 1.0, 0.3))`. In the fragment shader:

1. Normalize the incoming normal.
2. Calculate the dot product with that light direction and clamp its lower bound to zero using `max`.
3. Set brightness to `0.2 + 0.8 * diffuse`.
4. Multiply the color's `.rgb` by brightness and preserve its `.a` when constructing the returned `vec4f`.

The camera should be able to move without changing which world-facing surface is lit. This is diffuse lighting without a view-dependent shiny highlight.

## 3. Rotate the cube correctly

A rotated model needs rotated normals. General nonuniform scaling needs an **inverse-transpose normal matrix**. We will use a `mat4x4f` for it to keep the buffer layout straightforward.

Replace your uniform struct with:

```wgsl
struct Scene {
  mvp: mat4x4f,
  normalMatrix: mat4x4f,
}
@group(0) @binding(0) var<uniform> scene: Scene;
```

Allocate **128 bytes**. Use a `Float32Array(32)`, with MVP at float offset 0 and the normal matrix at float offset 16 (byte 64). Recreate the uniform buffer and bind group for the changed layout.

In JavaScript compute `mat4.transpose(mat4.inverse(model))`. Never invert a model scaled to zero. Upload both matrices together each frame. In WGSL, use `scene.mvp` for position, and transform normals with `scene.normalMatrix * vec4f(normal, 0.0)`, taking `.xyz`. Using w = 0 skips lesson 08's origin arrow, so translation stays out of the direction.

Now rotate the cube and verify the light stays fixed in world space. All later lessons use this 128-byte scene uniform unless explicitly stated otherwise.

## Check and troubleshoot

Try light directions straight up and straight right. Opposite faces should respond differently. If lighting follows camera rotation, you probably mixed view-space and world-space directions. If scale distorts lighting, check the inverse transpose and fragment normalization.

Explain: why can a position and normal require different matrices? Why clamp a negative dot product? Why normalize after interpolation?

Reference: [Directional lighting](https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-directional.html).

Next: [12: Textures](12-textures.md).
