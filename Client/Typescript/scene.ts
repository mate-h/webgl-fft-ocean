import { mat4, vec3 } from 'gl-matrix'
import { SkyBox } from './skybox'

export class Scene {
  gl: WebGLRenderingContext
  canvas: HTMLCanvasElement

  projMatrix: mat4
  viewMatrix: mat4

  frameNumber: number
  skybox: SkyBox
  ext: ANGLE_instanced_arrays|null

  constructor(gl, canvas) {
    this.gl = gl
    this.canvas = canvas
    this.projMatrix = mat4.create()
    this.viewMatrix = mat4.create()

    this.frameNumber = 0
    this.ext = this.gl.getExtension('ANGLE_instanced_arrays')
    this.skybox = new SkyBox(gl, 100)
  }

  public load() {
    debugger
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.gl.clearColor(0.0, 0.3, 0.5, 1.0)

    this.gl.clearDepth(1)
    this.gl.enable(this.gl.DEPTH_TEST)

    mat4.perspective(this.projMatrix, 65.0, 1.0, 0.1, 4000.0)
    mat4.lookAt(this.viewMatrix, vec3.clone([400, 300, 400]), vec3.clone([0, 0, 0]), vec3.clone([0, 1, 0]))

    this.skybox.create()
  }

  public render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

    this.skybox.render(this.projMatrix, this.viewMatrix)

    this.frameNumber = requestAnimationFrame(() => {
      this.render()
    })
  }
}

window.onload = () => {
  let canvas = <HTMLCanvasElement>document.getElementById('canvas')
  let gl = <WebGLRenderingContext>canvas.getContext('webgl')

  var scene = new Scene(gl, canvas)
  scene.load()
  scene.render()
}
