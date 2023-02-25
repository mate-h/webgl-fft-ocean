import { mat4, vec3 } from 'gl-matrix'
import { Texture } from './texture'
import { chunck } from './chunck'
import { Complex } from './Complex'
import { FFT2D } from './Fourier'
import { SkyBox } from './skybox'
import { Camera } from './Camera'
import { Plot } from './Plot'
import { FrameBuffer } from './FrameBuffer'
import { Phillips } from './Phillips'

export class Engine {
  gl: WebGL2RenderingContext
  canvas: HTMLCanvasElement
  wireframe: number

  projMatrix: mat4
  viewMatrix: mat4
  birdViewMatrix: mat4

  invProj: mat4
  invView: mat4

  ext: ANGLE_instanced_arrays | null
  floatExtension: OES_texture_float | null

  displacementTexture: Texture

  chunck: chunck
  time?: number
  interval: number
  h0: Complex[][]
  h1: Complex[][]
  fft: FFT2D
  test?: Complex[][]
  Phillips: Phillips
  frameNumber: number
  skybox: SkyBox

  camera: Camera
  birdCamera: Camera

  plot?: Plot
  reflection: FrameBuffer
  refraction?: FrameBuffer

  constructor(gl, canvas, wireframe) {
    this.gl = gl
    this.canvas = canvas
    this.projMatrix = mat4.clone(new Float32Array(16).fill(0))
    this.viewMatrix = mat4.clone(new Float32Array(16).fill(0))
    this.birdViewMatrix = mat4.clone(new Float32Array(16).fill(0))

    this.invProj = mat4.clone(new Float32Array(16).fill(0))
    this.invView = mat4.clone(new Float32Array(16).fill(0))

    this.chunck = new chunck(gl, 512)

    this.interval = 1.0
    this.ext = this.gl.getExtension('ANGLE_instanced_arrays')
    this.floatExtension = this.gl.getExtension('OES_texture_float')

    this.gl.getExtension('OES_texture_float_linear')
    this.gl.getExtension('EXT_color_buffer_float')

    this.Phillips = new Phillips(this.gl, 64)

    this.h0 = this.Phillips.createH0()
    this.h1 = this.Phillips.createH1()
    this.fft = new FFT2D(64)
    this.frameNumber = 0
    this.wireframe = wireframe
    this.skybox = new SkyBox(gl, 100)

    this.reflection = new FrameBuffer(
      window.innerWidth,
      window.innerHeight,
      this.gl
    )

    this.camera = new Camera(
      vec3.clone([26, 4.0, 326]),
      vec3.clone([26.417, 4.0, 325.4]),
      vec3.clone([0, 1, 0])
    )
    this.birdCamera = new Camera(
      vec3.clone([26, 140, 400.0]),
      vec3.clone([26.417, 131.32, 325.4]),
      vec3.clone([0, 1, 0])
    )

    this.displacementTexture = new Texture(this.gl, 64)
  }

  public load() {
    this.gl.getExtension('OES_element_index_uint')

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0)
    this.gl.clearDepth(1)
    this.gl.enable(this.gl.DEPTH_TEST)

    this.skybox.create()
    this.chunck.create()

    this.reflection.CreateFrameBuffer()
  }

  private generateWaves() {
    this.frameNumber = window.requestAnimationFrame(() => {
      this.interval += 1.0 / 6.0

      let spectrum = this.Phillips.update(this.interval, this.h0, this.h1)

      let h = this.fft.Inverse2D(spectrum.h)
      let x = this.fft.Inverse2D(spectrum.x)
      let z = this.fft.Inverse2D(spectrum.z)

      this.displacementTexture.texture(x, h, z)
      this.render()
    })
  }

  public render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    var text = document.getElementById('camera-height') as HTMLInputElement
    text!.value = this.camera.position[1].toString()
    // prettier-ignore
    var reflectionMatrix = mat4.clone([
        1.0, 0.0, 0.0, 0.0,
        0.0, -1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    var reflView = mat4.create()
    mat4.multiply(reflView, this.viewMatrix, reflectionMatrix)
    //REFLECTION FRAMEBUFFER RENDERING
    this.reflection.BeginRenderframeBuffer()
    this.skybox.render(this.projMatrix, reflView, true, false)
    this.reflection.EndRenderBuffer()

    //REST OF SCENE
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    this.skybox.render(this.projMatrix, this.viewMatrix, false, false)
    this.generateWaves()
    mat4.perspective(this.projMatrix, 55.0, 1.0, 0.1, 4000.0)
    mat4.perspective(this.invProj, 65.0, 1.0, 0.01, 4000.0)
    mat4.lookAt(
      this.viewMatrix,
      this.camera.position,
      this.camera.lookAt,
      this.camera.up
    )
    mat4.invert(this.invView, this.viewMatrix)
    mat4.invert(this.invProj, this.invProj)
    this.projMatrix[0] = 1.9209821224212646
    this.projMatrix[5] = 1.9209821224212646
    this.invProj[0] = 0.6370702385902405
    this.invProj[5] = 0.6370702385902405
    this.chunck.Draw(
      this.ext,
      this.wireframe,
      this.camera,
      this.projMatrix,
      this.viewMatrix,
      this.reflection,
      this.displacementTexture,
      this.refraction,
      this.invProj,
      this.invView,
      this.birdViewMatrix
    )
  }
}

export function logObject(obj) {
  const info = JSON.stringify(obj, (key, value) => {
    const arr = ['indices', 'vertices', 'h0', 'h1', 'imagedata']
    if (arr.includes(key)) {
      return undefined
    }
    return value
  })
  console.log('[DEBUG]', info)
}
