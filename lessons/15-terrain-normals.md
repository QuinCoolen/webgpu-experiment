# Lesson 15: Light the hills

Prerequisite: [14: Heights](14-terrain-heights.md). Goal: generate normals so slopes facing the light appear brighter.

## Measure how height changes

A flat ground normal is `(0,1,0)`. On a hill, the surface tilts. We can estimate its tilt by sampling the height a small distance to each side of a point. This is a **finite difference**: approximating a rate of change from nearby values.

Use a fixed `epsilon = 0.25` world units. At location x,z:

```text
slopeX = (heightAt(x+epsilon,z) - heightAt(x-epsilon,z)) / (2*epsilon)
slopeZ = (heightAt(x,z+epsilon) - heightAt(x,z-epsilon)) / (2*epsilon)
normal = normalize([-slopeX, 1, -slopeZ])
```

The negative signs tilt the normal away from the uphill direction. For a flat height function, both slopes are zero, recovering straight up. Normalization divides all components by the vector's length, `Math.hypot(nx, ny, nz)`.

## Your implementation

1. Export `normalAt(x, z)` beside `heightAt`. Use the formulas above to return three normalized components.
2. During vertex generation, replace the fixed up normal with `normalAt(worldX, worldZ)`. Keep position, color, and UV fields in their existing order and the stride at 48 bytes.
3. Regenerate and upload the mesh. Keep the fragment shader's normal normalization and diffuse light calculation from lesson 11.

Sample the global height function even outside the mesh boundaries. Do not clamp samples to the current patch's edge. That way two neighboring patches will produce the same normal at their shared position. Keep epsilon fixed in world units when grid density changes later.

## Understand the approximation

These normals describe the smooth height function, whereas the actual mesh consists of flat triangles approximating that function. Smooth interpolated lighting makes the terrain look smoother, but it does not add vertices or smooth its silhouette.

Large epsilon averages slopes over a broad region; tiny epsilon can be sensitive to numerical precision. The selected value is a practical starting point for our frequencies and units, not a universal constant.

## Check with known surfaces

Use these temporary height functions before restoring noise:

| Height function | Expected normal |
| --- | --- |
| `return 0` | `(0,1,0)` |
| `return x` | Approximately `(-0.707,0.707,0)` |
| `return z` | Approximately `(0,0.707,-0.707)` |

Confirm normal lengths are approximately 1. Then restore the hills and move the camera: light should remain tied to slope direction, not the camera. Switch the light from positive X to negative X and inspect opposite slopes.

If everything is black, check normal offset 28, location 2 at vertex input, and the lighting sign convention (direction toward the light). If only boundaries look wrong, inspect global sampling and epsilon. Use identity model and normal matrices for terrain vertices already in world coordinates.

Explain: why sample both sides of a point? Why is the y component initially 1? Why must neighboring chunks use the same height function and sampling distance?

Reference: [Normal vectors and directional lighting](https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-directional.html).

Next: [16: Chunks](16-terrain-chunks.md).
