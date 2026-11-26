# Project Z · Digital Frontiers

A scroll-driven space atlas for an independent IT studio in Kerala. Three imagined worlds introduce web platforms, workflow automation, and interactive experiences.

## Explore

Scroll through the expedition or select a destination in the flight path. Drag a planet to rotate it, or focus it and use the left and right arrow keys. Still mode stops GPU rendering. The service descriptions, project examples, and email link also work without graphics acceleration.

## Run

Run `python3 -m http.server 8080` from the repository root and open <http://localhost:8080>. Run `node tools/build.mjs` to copy the production site to `dist/`.

## Rendering

The browser tries WebGPU, then WebGL 2. Both render a three-dimensional sphere and inclined ring plane using one fullscreen triangle. The shaders resolve surface normals, the front and back of the rings, their shadow, and atmospheric scattering. Scroll position blends the three surfaces. Measured frame time controls pixel density and ring detail. Rendering pauses offscreen and in background tabs.

Each world has an original prerendered WebP available on first paint. Reduced-motion and data-saving preferences start in still mode. The WebGPU device-loss handler can switch to WebGL, and a lost WebGL context returns to the poster.

Edit copy in `index.html` and `src/main.js`. Edit the shared shader math in `src/orbit.glsl`, then run `python3 tools/build-wgsl.py`. The generated WGSL is checked in. Rebuild the original artwork with `python3 tools/make-art.py` (NumPy, SciPy, Pillow). Font licenses are in `assets/licenses/`.
