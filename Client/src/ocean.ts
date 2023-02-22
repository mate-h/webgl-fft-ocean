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
    this.projMatrix = mat4.create()
    this.viewMatrix = mat4.create()
    this.birdViewMatrix = mat4.create()

    this.invProj = mat4.create()
    this.invView = mat4.create()

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

    this.reflection = new FrameBuffer(window.innerWidth, window.innerHeight, this.gl)

    this.camera = new Camera(vec3.clone([26, 4.0, 326]), vec3.clone([26.417, 4.0, 325.4]), vec3.clone([0, 1, 0]))
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

    let text = <HTMLInputElement>document.getElementById('camera-height')

    text.value = this.camera.position[1]

    let reflectionMatrix = mat4.clone([1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0])
    var reflView = mat4.create()
    mat4.multiply(this.viewMatrix, reflectionMatrix, reflView)

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

    mat4.lookAt(this.viewMatrix, this.camera.position, this.camera.lookAt, this.camera.up)

    mat4.invert(this.viewMatrix, this.invView)
    mat4.invert(this.invProj, this.invProj)

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

window.onload = () => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  let gl = canvas.getContext('webgl2', { antialias: true })!
  var engine = new Engine(gl, canvas, gl.TRIANGLES)
  engine.load()

  engine.render()

  let choppiness = document.getElementById('choppiness') as HTMLInputElement
  let wireframeButton = document.getElementById('wireframe') as HTMLInputElement

  wireframeButton.onchange = (e) => {
    if (engine.wireframe === gl.TRIANGLES) {
      engine.wireframe = gl.LINES
    } else {
      engine.wireframe = gl.TRIANGLES
    }
  }

  choppiness.oninput = (e) => {
    engine.displacementTexture.lambda = parseInt((<any>e.target).value) / 10
  }

  document.onkeydown = (e) => {
    switch (e.which) {
      case 87: {
        if (engine.wireframe === gl.TRIANGLES) {
          engine.wireframe = gl.LINES
        } else {
          engine.wireframe = gl.TRIANGLES
        }
        break
      }

      case 39: {
        engine.camera.lookRight()
        break
      }

      case 37: {
        engine.camera.lookLeft()
        break
      }

      case 38: {
        engine.camera.moveForward()
        break
      }

      case 40: {
        engine.camera.moveBackward()
        break
      }
      case 90: {
        engine.camera.moveDown()
        break
      }

      case 65: {
        engine.camera.moveUp()
        break
      }

      case 83: {
        engine.camera.lookDown()
        break
      }

      case 88: {
        engine.camera.lookUp()
        break
      }
    }
  }
}
