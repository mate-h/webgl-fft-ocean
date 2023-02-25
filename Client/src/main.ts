import { Engine } from "./ocean"

export function main() {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  let gl = canvas.getContext('webgl2', { antialias: true })!
  let engine = new Engine(gl, canvas, gl.TRIANGLES)
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

window.onload = main