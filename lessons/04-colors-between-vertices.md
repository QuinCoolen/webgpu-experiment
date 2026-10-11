# Exercise 04: Colors between vertices

Goal: turn your black rectangle into a rectangle with colored corners and gradients between them.

Your six positions already describe two triangles. This time, each vertex will carry a color as well as a position. The GPU will calculate intermediate color values across each triangle. That calculation is called **interpolation**.

For example, halfway along an edge whose endpoints are red `(1, 0, 0)` and blue `(0, 0, 1)`, the interpolated RGB values are `(0.5, 0, 0.5)`. All your positions use w = 1, so this simple weighted mixing applies here. You won't write the interpolation calculation yourself.

## Part 1: Return position AND color

Your vertex shader currently returns one `vec4f`. To return two named values, WGSL uses a **struct**: a type with named fields, a little like the shape of a JavaScript object.

Add this type inside your `shaderCode` string, above the shader functions:

```wgsl
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}
```

The position field keeps its special meaning. The color field uses a numbered slot for passing your own data between shader stages.

Change your vertex function's return declaration from:

```wgsl
-> @builtin(position) vec4f
```

to:

```wgsl
-> VertexOutput
```

The position annotation now lives on the struct's field.

Keep your existing position array. Beside it, create a `colors` array containing six `vec4f` colors. Use this mapping to match your current vertex order:

| Index | Corner | Color | RGBA |
| --- | --- | --- | --- |
| 0 | Top left | Red | `(1, 0, 0, 1)` |
| 1 | Bottom left | Green | `(0, 1, 0, 1)` |
| 2 | Bottom right | Blue | `(0, 0, 1, 1)` |
| 3 | Bottom right | Blue | `(0, 0, 1, 1)` |
| 4 | Top right | White | `(1, 1, 1, 1)` |
| 5 | Top left | Red | `(1, 0, 0, 1)` |

Your duplicated corners need matching colors so the two triangles agree along their shared edge.

Replace your old return statement by building a result:

```wgsl
var output: VertexOutput;
// TODO: assign output.position using your existing position calculation.
// TODO: assign output.color using the color at this vertex's index.
// TODO: return output.
```

`var` permits assignments after declaration. Use `output.position = ...;` and `output.color = ...;` to fill the fields. Keep z = 0 and w = 1 in the position. The color's fourth component is alpha, which should also stay at 1.

You can pause here and ask for a review. The shader interface will only be fully connected once you finish Part 2.

## Part 2: Receive the interpolated color

Give your fragment shader a parameter:

```wgsl
@fragment
fn fragmentMain(@location(0) color: vec4f) -> @location(0) vec4f {
  // TODO: return the incoming color instead of your constant black color.
}
```

The location numbers have roles determined by where they appear:

| Annotation | Meaning here |
| --- | --- |
| Vertex output `@location(0)` | Send vertex color through slot 0 |
| Fragment input `@location(0)` | Receive slot 0's interpolated value |
| Fragment return `@location(0)` | Write the resulting color to color target 0 |

The GPU matches the vertex output to the fragment input by location and compatible type. The parameter name is your choice. Each fragment receives the color calculated for its place within that triangle, rather than the whole colors array.

Reference: [WebGPU Fundamentals: Inter-stage variables](https://webgpufundamentals.org/webgpu/lessons/webgpu-inter-stage-variables.html). It contains completed examples if you want extra help.

## Part 3: Inspect and experiment

Keep `draw(6)` and your current pipeline and pass setup. All the rendering changes for this exercise fit inside the shader string. Update the status text to describe submitting a colored rectangle.

Save and inspect the canvas and console. You should see red, green, blue, and white corners with gradients across the two triangles. Colors should meet continuously along their shared diagonal, though the direction of the gradient can change there. The pink background should remain visible around the rectangle.

Predict each result before trying these:

1. Give all six entries the same color. What happens to the gradient?
2. Restore the colors, then change index 3 to red while keeping index 2 blue. They occupy the same corner in different triangles. What happens along their shared edge? Restore blue afterward.
3. Change the x coordinate of both top-left entries, indices 0 and 5, from -0.6 to -0.3. Observe how the shape and gradient change together, then restore the rectangle.

If you see shader errors, check semicolons after assignments and returns, commas between struct fields, and matching `vec4f` types for the color output and input. The Vite build does not validate WGSL.

Before moving on:

- Why does the vertex shader now return a struct?
- Who computes the colors between the vertices?
- Why do indices 2 and 3 need matching colors for the gradient to meet continuously?
- What does `@location(0)` connect between the two shaders?
