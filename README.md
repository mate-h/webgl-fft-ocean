# webgl-fft-ocean

Webgl Ocean based on Tessendorf paper. Implementation of Phillips spectrum and its inverse FFT.

The grid used is a projected grid from screenspace to worldspace.
The static, dynamic Phillips spectrum and the inverse FFT of it is displayed on the left panel.

To run the program:
- `pnpm i`
- `pnpm run dev`

Commands:
  - W: toggle wireframe
  - Left, right, up, down arrow: displacement given a direction
  - s,x: pitch,
  - a,z : up, down

Small program written in typescript. It displays a wave constructed by the inverse FFT of the Phillips spectrum.

Further work: 
 - The sun is missing, should be added in the skybox shader
 - Better and more realistic scattering should be implemented
 - better UX
 - remove symmetry on the ocean by blending it with perlin noise
 - port the FFT on the GPU: 
  - IDFT Ocean spectrum (Tessendorf) at https://www.shadertoy.com/view/wt2yRd
  - Ocean surface: Fourier at https://www.shadertoy.com/view/tdSfWG

<img src="https://github.com/mate-h/webgl-fft-ocean/raw/main/waves1.PNG" width="600" style="max-width:100%;">
<img src="https://github.com/mate-h/webgl-fft-ocean/raw/main/Capture.PNG" width="600" style="max-width:100%;">

<br>
<a href="https://www.youtube.com/watch?v=eGQRCdBPOO4">Video</a>

