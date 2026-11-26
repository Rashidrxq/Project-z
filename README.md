# Project Z · Digital Frontiers

A scroll-driven space atlas for an independent IT studio in Kerala. Three imagined worlds introduce web platforms, workflow automation, and interactive experiences.

## Explore

Scroll through the expedition or select a destination in the flight path. Drag a planet to rotate it, or focus it and use the left and right arrow keys. Still mode stops GPU rendering. The service descriptions, project examples, and email link also work without graphics acceleration.

## Run

Run `node tools/build.mjs`, then `python3 -m http.server 8080 --directory dist`. Open <http://localhost:8080>. Vercel runs the same build and publishes `dist/`.

## Rendering

The browser tries WebGPU, then WebGL 2. Both render a three-dimensional sphere and inclined ring plane using one fullscreen triangle. The shaders resolve surface normals, the front and back of the rings, their shadow, and atmospheric scattering. Scroll position blends the three surfaces. Measured frame time controls pixel density and ring detail. Rendering pauses offscreen and in background tabs.

Each world has an original prerendered WebP available on first paint. Reduced-motion and data-saving preferences start in still mode. The WebGPU device-loss handler can switch to WebGL, and a lost WebGL context returns to the poster.

The home atlas is in `content/expedition.html` and `src/main.js`. Edit company pages in `content/pages.mjs`, services and articles in `content/editorial.mjs`, and common navigation and contact details in `content/layout.mjs`. The build outputs static pages, a sitemap, and crawler instructions. Quote enquiries prepare an email draft on the visitor’s device. The visitor sends it via their email app or copies it to webmail. The careers page accepts expressions of interest. Edit the shared shader math in `src/orbit.glsl`, then run `python3 tools/build-wgsl.py`. The generated WGSL is checked in. Rebuild the original artwork with `python3 tools/make-art.py` (NumPy, SciPy, Pillow). Font licenses are in `assets/licenses/`.
