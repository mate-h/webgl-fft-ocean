import { Buffer } from './buffer'
import { Texture } from './texture'

export class SkyBox extends Buffer {
  size: number
  indices: Array<number>
  texture?: Texture

  constructor(gl, size) {
    super(gl)

    this.gl = gl
    this.size = size
    this.indices = []

    new Texture(this.gl, 512).createTexture((texture) => {
      this.texture = texture
    })

    super.createProgram('skyBoxVertexShader', 'skyBoxFragmentShader', false)
  }

  public create() {
    // prettier-ignore
    let vertices = [
        -1, -1, -1, 0.25, 2.0/3.0,
        -1, -1, 1,  0.25,  1.0,
        1,  -1, 1,  0.5, 1.0,
        1,  -1, -1,  0.5, 2.0/3.0,
        
        -1,  1, -1,  0.25, 1.0/3.0,
        -1,  1,  1,  0.25, 0.0,
        1,  1,  1,  0.5, 0.0,
        1,  1,  -1, 0.5, 1.0/3.0, 

        -1, -1, -1, 0.25, 2.0/3.0,
        -1,  1, -1, 0.25, 1.0/3.0,
        1,  1, -1, 0.5, 1.0/3.0,
        1, -1, -1, 0.5, 2.0/3.0,
        
        -1, -1,  1, 1.0, 2.0/3.0,              
        -1,  1,  1, 1.0, 1.0/3.0, 
        1,  1,  1, 0.75, 1.0/3.0,
        1, -1,  1, 0.75, 2.0/3.0,

        1, -1, -1, 0.5, 2.0/3.0,
        1,  1, -1, 0.5, 1.0/3.0,
        1,  1,  1, 0.75, 1.0/3.0,
        1, -1,  1, 0.75, 2.0/3.0,
        
        -1, -1, -1,  0.25, 2.0/3.0,
        -1,  1, -1,  0.25, 1.0/3.0,
        -1,  1,  1,  0.0 , 1.0/3.0,
        -1, -1,  1 , 0.0, 2.0/3.0
    ];

    // prettier-ignore
    this.indices = [0, 1, 2, 2, 3, 0, 
                    4, 5, 6, 6, 7, 4, 
                    8, 9, 10, 10, 11, 8,
                    12, 13, 14, 14, 15, 12,
                    16, 17, 18, 18, 19, 16,
                    20, 21, 22, 22, 23, 20];

    this.gl.useProgram(this.program)

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW)

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), this.gl.STATIC_DRAW)

    this.gl.useProgram(null)
  }

  public render(projMatrix, viewMatrix, isclipped = false, isReflection = false) {
    this.gl.useProgram(this.program)

    if (isReflection) this.gl.uniform4f(this.program.clipPlane, 0, 1, 0, 1.0)
    else this.gl.uniform4f(this.program.clipPlane, 0, -1, 0, 1.0)

    if (isclipped) this.gl.uniform1f(this.program.isclipped, 1.0)
    else this.gl.uniform1f(this.program.isclipped, 0.0)

    this.gl.uniformMatrix4fv(this.program.projectionMatrix, false, projMatrix)
    this.gl.uniformMatrix4fv(this.program.viewMatrixMatrix, false, viewMatrix)

    if (this.texture) {
      this.gl.activeTexture(this.gl.TEXTURE0)
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
    this.gl.enableVertexAttribArray(this.program.vertexPositionAttribute)

    this.gl.vertexAttribPointer(this.program.vertexPositionAttribute, 3, this.gl.FLOAT, false, 20, 0)
    this.gl.vertexAttribPointer(this.program.texcoord, 2, this.gl.FLOAT, false, 20, 12)

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

    this.gl.depthMask(false)
    this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_BYTE, 0)
    this.gl.depthMask(true)

    this.gl.useProgram(null)
  }
}
