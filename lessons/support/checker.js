// A deliberately tiny opaque RGBA image for learning texture uploads.
const width = 4;
const height = 4;
const pixels = new Uint8Array(width * height * 4);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const light = (x + y) % 2 === 0;
    pixels.set(light ? [240, 220, 160, 255] : [35, 65, 90, 255], (y * width + x) * 4);
  }
}
export const checkerImage = { width, height, pixels };
