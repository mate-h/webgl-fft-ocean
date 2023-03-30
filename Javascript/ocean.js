var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//MIT License
//Copyright (c) 2016 Frederic Dumont
//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:
//The above copyright notice and this permission notice shall be included in all
//copies or substantial portions of the Software.
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//SOFTWARE. 
var Ocean;
(function (Ocean) {
    var Buffer = (function () {
        function Buffer(gl) {
            this.gl = gl;
            this.program = gl.createProgram();
            this.offsetBuffer = gl.createBuffer();
            this.vertexBuffer = gl.createBuffer();
            this.indexBuffer = gl.createBuffer();
        }
        Buffer.prototype.update = function (vertices) {
            this.gl.useProgram(this.program);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
            this.program.vertexPositionAttribute = this.gl.getAttribLocation(this.program, "position");
            this.gl.enableVertexAttribArray(this.program.vertexPositionAttribute);
            this.gl.useProgram(null);
        };
        Buffer.prototype.createProgram = function (vShaderId, fShaderId, isOcean) {
            var vshaderScript = document.getElementById(vShaderId);
            var fshaderScript = document.getElementById(fShaderId);
            var vShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.gl.shaderSource(vShader, vshaderScript.textContent);
            this.gl.compileShader(vShader);
            var fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(fShader, fshaderScript.textContent);
            this.gl.compileShader(fShader);
            this.gl.attachShader(this.program, vShader);
            this.gl.attachShader(this.program, fShader);
            var vshaderError = this.gl.getShaderInfoLog(vShader);
            var fshaderError = this.gl.getShaderInfoLog(fShader);
            console.log(vshaderError);
            console.log(fshaderError);
            this.gl.linkProgram(this.program);
            var error = this.gl.getProgramInfoLog(this.program);
            this.gl.useProgram(this.program);
            if (isOcean) {
                this.program.time = this.gl.getUniformLocation(this.program, "time");
                this.program.spectrum = this.gl.getUniformLocation(this.program, "displacement");
                this.program.reflection = this.gl.getUniformLocation(this.program, "reflectionSampler");
                this.program.refraction = this.gl.getUniformLocation(this.program, "refractionSampler");
            }
            else {
                this.program.texture = this.gl.getUniformLocation(this.program, "texture");
                this.program.clipPlane = this.gl.getUniformLocation(this.program, "clipplane");
                this.program.isclipped = this.gl.getUniformLocation(this.program, "isclipped");
            }
            this.program.cameraPosition = this.gl.getUniformLocation(this.program, "cameraPosition");
            this.program.texcoord = this.gl.getAttribLocation(this.program, "texCoord");
            this.program.vertexPositionAttribute = this.gl.getAttribLocation(this.program, "position");
            this.program.projectionMatrix = this.gl.getUniformLocation(this.program, "projMatrix");
            this.program.viewMatrixMatrix = this.gl.getUniformLocation(this.program, "viewMatrix");
            this.program.invViewMatrix = this.gl.getUniformLocation(this.program, "invViewMatrix");
            this.program.invProjMatrix = this.gl.getUniformLocation(this.program, "invProjMatrix");
            this.program.birdviewMatrix = this.gl.getUniformLocation(this.program, "birdviewMatrix");
            this.gl.useProgram(null);
        };
        return Buffer;
    }());
    Ocean.Buffer = Buffer;
})(Ocean || (Ocean = {}));
var Ocean;
(function (Ocean) {
    var chunck = (function (_super) {
        __extends(chunck, _super);
        function chunck(gl, size) {
            _super.call(this, gl);
            this.gl = gl;
            this.size = size;
            this.indices = [];
            this.vertices = [];
            this.clipPlane = [];
            _super.prototype.createProgram.call(this, 'vertexShader', 'fragmentShader', true);
        }
        chunck.prototype.update = function () {
            _super.prototype.update.call(this, this.vertices);
        };
        chunck.prototype.create = function () {
            var k = 0, n = 0;
            for (var i = 0; i < this.size + 1; i++) {
                for (var j = 0; j < this.size + 1; j++) {
                    this.vertices[k] = -1 + 2 * i / (this.size);
                    this.vertices[k + 1] = 0.0;
                    this.vertices[k + 2] = -1 + 2 * j / (this.size);
                    k += 3;
                }
            }
            for (var i = 0; i < this.size; i++) {
                for (var j = 0; j < this.size; j++) {
                    this.indices[n] = i + j * (this.size + 1);
                    this.indices[n + 1] = i + 1 + j * (this.size + 1);
                    this.indices[n + 2] = i + (j + 1) * (this.size + 1);
                    this.indices[n + 3] = i + (j + 1) * (this.size + 1);
                    this.indices[n + 4] = i + 1 + j * (this.size + 1);
                    this.indices[n + 5] = i + 1 + (j + 1) * (this.size + 1);
                    n += 6;
                }
            }
            this.gl.useProgram(this.program);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), this.gl.DYNAMIC_DRAW);
            this.gl.useProgram(null);
        };
        chunck.prototype.Draw = function (ext, wireframe, camera, projMatrix, viewMatrix, reflection, displacement, refraction, invProj, invView, birdviewMatrix) {
            this.gl.useProgram(this.program);
            //camera position, up vector, lookAt
            this.gl.uniform3f(this.program.cameraPosition, camera.position[0], camera.position[1], camera.position[2]);
            this.gl.uniform3f(this.program.upVector, camera.up[0], camera.up[1], camera.up[2]);
            this.gl.uniform3f(this.program.lookAt, camera.lookAt[0], camera.lookAt[1], camera.lookAt[2]);
            this.gl.uniformMatrix4fv(this.program.invViewMatrix, false, invView);
            this.gl.uniformMatrix4fv(this.program.invProjMatrix, false, invProj);
            this.gl.uniformMatrix4fv(this.program.projectionMatrix, false, projMatrix);
            this.gl.uniformMatrix4fv(this.program.viewMatrixMatrix, false, viewMatrix);
            this.gl.uniformMatrix4fv(this.program.birdviewMatrix, false, birdviewMatrix);
            this.gl.bindTexture(this.gl.TEXTURE_2D, displacement.displacementTexture);
            this.gl.activeTexture(this.gl.TEXTURE0 + 1);
            this.gl.uniform1i(this.program.reflection, 1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, reflection.texture);
            this.gl.activeTexture(this.gl.TEXTURE0 + 2);
            this.gl.uniform1i(this.program.reflection, 2);
            //LOAD OCEAN GRID
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.enableVertexAttribArray(this.program.vertexPositionAttribute);
            this.gl.vertexAttribPointer(this.program.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.drawElements(wireframe, this.indices.length, this.gl.UNSIGNED_INT, 0);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
            this.gl.disable(this.gl.BLEND);
            this.gl.useProgram(null);
        };
        return chunck;
    }(Ocean.Buffer));
    Ocean.chunck = chunck;
})(Ocean || (Ocean = {}));
var Ocean;
(function (Ocean) {
    var Complex = (function () {
        function Complex(x, y) {
            this.x = x;
            this.y = y;
        }
        Complex.Conj = function (a) {
            return new Complex(a.x, -a.y);
        };
        Complex.add = function (a, b) {
            return new Complex(a.x + b.x, a.y + b.y);
        };
        Complex.substract = function (a, b) {
            return new Complex(a.x - b.x, a.y - b.y);
        };
        Complex.mult = function (a, b) {
            return new Complex(a.x * b.x - a.y * b.y, a.x * b.y + b.x * a.y);
        };
        Complex.multScalar = function (a, b) {
            return new Complex(a.x * b, a.y * b);
        };
        Complex.divideScalar = function (a, b) {
            return new Complex(a.x / b, a.y / b);
        };
        Complex.Polar = function (r, angle) {
            return new Complex(r * Math.cos(angle), r * Math.sin(angle));
        };
        Complex.Modulus = function (a) {
            return Math.sqrt(a.x * a.x + a.y * a.y);
        };
        return Complex;
    }());
    Ocean.Complex = Complex;
})(Ocean || (Ocean = {}));
var Ocean;
(function (Ocean) {
    var FFT = (function () {
        function FFT(size) {
            this.size = size;
        }
        FFT.prototype.Inverse = function (input) {
            var transform = [];
            for (var i = 0; i < input.length; i++) {
                input[i] = Ocean.Complex.Conj(input[i]);
            }
            transform = this.Forward(input);
            for (var i = 0; i < input.length; i++) {
                transform[i] = Ocean.Complex.Conj(transform[i]);
            }
            return transform;
        };
        FFT.prototype.Forward = function (input) {
            var result = new Array(input.length);
            var omega = (-2.0 * Math.PI) / input.length;
            if (input.length <= 1) {
                result[0] = input[0];
                if (isNaN(input[0].x) || isNaN(input[0].y)) {
                    result[0] = new Ocean.Complex(0.0, 0.0);
                    input[0] = result[0];
                }
                return result;
            }
            var evenInput = new Array(input.length / 2);
            var oddInput = new Array(input.length / 2);
            for (var k = 0; k < input.length / 2; k++) {
                evenInput[k] = input[2 * k];
                oddInput[k] = input[2 * k + 1];
            }
            var even = this.Forward(evenInput);
            var odd = this.Forward(oddInput);
            for (var k = 0; k < input.length / 2; k++) {
                var polar = Ocean.Complex.Polar(1.0, omega * (k));
                odd[k] = Ocean.Complex.mult(odd[k], polar);
            }
            for (var k = 0; k < input.length / 2; k++) {
                result[k] = Ocean.Complex.add(even[k], odd[k]);
                result[k + input.length / 2] = Ocean.Complex.substract(even[k], odd[k]);
            }
            return result;
        };
        return FFT;
    }());
    Ocean.FFT = FFT;
    var FFT2D = (function (_super) {
        __extends(FFT2D, _super);
        function FFT2D(size) {
            _super.call(this, size);
        }
        FFT2D.prototype.Inverse2D = function (inputComplex) {
            var p = [];
            var f = [];
            var t = [];
            var floatImage = [];
            for (var l = 0; l < this.size; l++) {
                p[l] = _super.prototype.Inverse.call(this, inputComplex[l]);
            }
            for (var l = 0; l < this.size; l++) {
                t[l] = new Array(this.size);
                for (var k = 0; k < this.size; k++) {
                    t[l][k] = Ocean.Complex.divideScalar(p[k][l], this.size * this.size);
                }
                f[l] = _super.prototype.Inverse.call(this, t[l]);
            }
            for (var k = 0; k < this.size; k++) {
                floatImage[k] = [];
                for (var l = 0; l < this.size; l++) {
                    floatImage[k][l] = f[k][l].x;
                }
            }
            return floatImage;
        };
        return FFT2D;
    }(FFT));
    Ocean.FFT2D = FFT2D;
})(Ocean || (Ocean = {}));
var Ocean;
(function (Ocean) {
    var Engine = (function () {
        function Engine(gl, canvas, wireframe) {
            this.gl = gl;
            this.canvas = canvas;
            this.projMatrix = mat4.create();
            this.viewMatrix = mat4.create();
            this.birdViewMatrix = mat4.create();
            this.invProj = mat4.create();
            this.invView = mat4.create();
            this.chunck = new Ocean.chunck(gl, 512);
            this.interval = 1.0;
            this.ext = this.gl.getExtension("ANGLE_instanced_arrays");
            this.floatExtension = this.gl.getExtension("OES_texture_float");
            this.gl.getExtension("OES_texture_float_linear");
            this.gl.getExtension("EXT_color_buffer_float");
            this.Phillips = new Ocean.Phillips(this.gl, 64);
            this.h0 = this.Phillips.createH0();
            this.h1 = this.Phillips.createH1();
            this.fft = new Ocean.FFT2D(64);
            this.frameNumber = 0;
            this.wireframe = wireframe;
            this.skybox = new Ocean.SkyBox(gl, 100);
            this.reflection = new Ocean.FrameBuffer(window.innerWidth, window.innerHeight, this.gl);
            this.camera = new Ocean.Camera(vec3.create([26, 4.0, 326]), vec3.create([26.417, 4.0, 325.4]), vec3.create([0, 1, 0]));
            this.birdCamera = new Ocean.Camera(vec3.create([26, 140, 400.0]), vec3.create([26.417, 131.32, 325.4]), vec3.create([0, 1, 0]));
            this.displacementTexture = new Ocean.Texture(this.gl, 64);
        }
        Engine.prototype.load = function () {
            this.gl.getExtension('OES_element_index_uint');
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
            this.gl.clearDepth(1);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.skybox.create();
            this.chunck.create();
            this.reflection.CreateFrameBuffer();
        };
        Engine.prototype.generateWaves = function () {
            var _this = this;
            this.frameNumber = window.requestAnimationFrame(function () {
                _this.interval += 1.0 / 6.0;
                var spectrum = _this.Phillips.update(_this.interval, _this.h0, _this.h1);
                var h = _this.fft.Inverse2D(spectrum.h);
                var x = _this.fft.Inverse2D(spectrum.x);
                var z = _this.fft.Inverse2D(spectrum.z);
                _this.displacementTexture.texture(x, h, z);
                _this.render();
            });
        };
        Engine.prototype.render = function () {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            var text = document.getElementById("camera-height");
            text.value = this.camera.position[1];
            var reflectionMatrix = mat4.create([1.0, 0.0, 0.0, 0.0,
                0.0, -1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0]);
            var reflView = mat4.create();
            mat4.multiply(this.viewMatrix, reflectionMatrix, reflView);
            //REFLECTION FRAMEBUFFER RENDERING
            this.reflection.BeginRenderframeBuffer();
            this.skybox.render(this.projMatrix, reflView, true, false);
            this.reflection.EndRenderBuffer();
            //REST OF SCENE
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.skybox.render(this.projMatrix, this.viewMatrix, false, false);
            this.generateWaves();
            mat4.perspective(55.0, 1.0, 0.1, 4000.0, this.projMatrix);
            mat4.perspective(65.0, 1.0, 0.01, 4000.0, this.invProj);
            mat4.lookAt(this.camera.position, this.camera.lookAt, this.camera.up, this.viewMatrix);
            mat4.inverse(this.viewMatrix, this.invView);
            mat4.inverse(this.invProj, this.invProj);
            this.chunck.Draw(this.ext, this.wireframe, this.camera, this.projMatrix, this.viewMatrix, this.reflection, this.displacementTexture, this.refraction, this.invProj, this.invView, this.birdViewMatrix);
        };
        return Engine;
    }());
    Ocean.Engine = Engine;
})(Ocean || (Ocean = {}));

function logObject(obj) {
    const info = JSON.stringify(obj, (key, value) => {
        const arr = ["indices", "vertices", "h0", "h1", "imagedata"]
        if (arr.includes(key)) {
            return undefined;
        }
        return value;
    });
    console.log("[DEBUG]", info);
}

window.onload = function () {
    var canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var gl = canvas.getContext('webgl2', { antialias: true });
    var engine = new Ocean.Engine(gl, canvas, gl.TRIANGLES);
    engine.load();
    engine.render();

    // logObject(engine);
    var choppiness = document.getElementById("choppiness");
    var wireframeButton = document.getElementById("wireframe");
    wireframeButton.onchange = function (e) {
        if (engine.wireframe === gl.TRIANGLES) {
            engine.wireframe = gl.LINES;
        }
        else {
            engine.wireframe = gl.TRIANGLES;
        }
    };
    choppiness.oninput = function (e) {
        engine.displacementTexture.lambda = parseInt(e.target.value) / 10;
    };
    document.onkeydown = function (e) {
        switch (e.which) {
            case 87:
                {
                    if (engine.wireframe === gl.TRIANGLES) {
                        engine.wireframe = gl.LINES;
                    }
                    else {
                        engine.wireframe = gl.TRIANGLES;
                    }
                    break;
                }
            case 39:
                {
                    engine.camera.lookRight();
                    break;
                }
            case 37:
                {
                    engine.camera.lookLeft();
                    break;
                }
            case 38:
                {
                    engine.camera.moveForward();
                    break;
                }
            case 40:
                {
                    engine.camera.moveBackward();
                    break;
                }
            case 90:
                {
                    engine.camera.moveDown();
                    break;
                }
            case 65:
                {
                    engine.camera.moveUp();
                    break;
                }
            case 83:
                {
                    engine.camera.lookDown();
                    break;
                }
            case 88:
                {
                    engine.camera.lookUp();
                    break;
                }
        }
    };
};
var Ocean;
(function (Ocean) {
    var Phillips = (function () {
        function Phillips(gl, size) {
            this.size = size;
            this.gl = gl;
            this.length = 900.0;
            this.windspeed = 50.0;
            this.windX = -0.5;
            this.windY = -0.5;
            this.A = 0.0001;
            this.g = 9.81;
        }
        Phillips.prototype.createH0 = function () {
            var result = [];
            var k = 0;
            var plot = new Ocean.Plot("spectrum", 64);
            for (var i = 0; i < this.size * 2; i++) {
                result[i] = [];
                for (var j = 0; j < this.size * 2; j++) {
                    var parameter = {
                        g: this.g,
                        A: this.A,
                        windSpeed: this.windspeed,
                        windX: this.windX,
                        windY: this.windY,
                        Kx: 2.0 * Math.PI * (i - this.size / 2.0) / this.length,
                        Ky: 2.0 * Math.PI * (j - this.size / 2.0) / this.length,
                    };
                    var spec = this.spectrum(parameter);
                    var h0 = this.calculateH0(spec);
                    result[i][j] = h0;
                    plot.imagedata.data[k] = spec * 255;
                    plot.imagedata.data[k + 1] = spec * 255;
                    plot.imagedata.data[k + 2] = spec * 255;
                    plot.imagedata.data[k + 3] = 255.0;
                    k += 4;
                }
            }
            plot.load();
            return result;
        };
        Phillips.prototype.createH1 = function () {
            var result = [];
            for (var i = 0; i < this.size * 2; i++) {
                result[i] = [];
                for (var j = 0; j < this.size * 2; j++) {
                    var parameter = {
                        g: this.g,
                        A: this.A,
                        windSpeed: this.windspeed,
                        windX: this.windX,
                        windY: this.windY,
                        Kx: 2.0 * Math.PI * (-i - this.size / 2.0) / this.length,
                        Ky: 2.0 * Math.PI * (-j - this.size / 2.0) / this.length,
                    };
                    var h0 = Ocean.Complex.Conj(this.calculateH0(this.spectrum(parameter)));
                    result[i][j] = Ocean.Complex.Conj(this.calculateH0(this.spectrum(parameter)));
                }
            }
            return result;
        };
        Phillips.prototype.update = function (time, h0, h1) {
            var plot = new Ocean.Plot("hu", 64);
            var result = { h: [], z: [], x: [] };
            var Kx, Ky = 0;
            var k = 0;
            for (var i = 0; i < this.size; i++) {
                result.h[i] = [];
                result.z[i] = [];
                result.x[i] = [];
                var h = new Ocean.Complex(0.0, 0.0);
                for (var j = 0; j < this.size; j++) {
                    Kx = 2.0 * Math.PI * (i - this.size / 2.0) / this.length;
                    Ky = 2.0 * Math.PI * (j - this.size / 2.0) / this.length;
                    var KK = Math.sqrt(Kx * Kx + Ky * Ky);
                    var omega = Math.sqrt(9.81 * KK);
                    var polar = Ocean.Complex.Polar(1.0, omega * time);
                    var h0t = Ocean.Complex.mult(h0[i][j], polar);
                    var h1t = Ocean.Complex.mult(h1[i][j], Ocean.Complex.Conj(polar));
                    var htilde = Ocean.Complex.add(h0t, h1t);
                    var imaginarydoth = Ocean.Complex.mult(new Ocean.Complex(0, 1.0), htilde);
                    var x = Ocean.Complex.multScalar(imaginarydoth, Kx / KK);
                    var z = Ocean.Complex.multScalar(imaginarydoth, Ky / KK);
                    plot.imagedata.data[k] = x.x * 255.0;
                    plot.imagedata.data[k + 1] = htilde.x * 255.0;
                    plot.imagedata.data[k + 2] = z.x * 255.0;
                    plot.imagedata.data[k + 3] = 255.0;
                    k += 4;
                    result.h[i][j] = htilde;
                    result.z[i][j] = z;
                    result.x[i][j] = x;
                }
            }
            plot.load();
            return result;
        };
        Phillips.prototype.spectrum = function (parameter) {
            var knormalized = Math.sqrt(parameter.Kx * parameter.Kx + parameter.Ky * parameter.Ky);
            if (knormalized < 0.000001)
                knormalized = 0.0;
            var wlength = Math.sqrt(parameter.windX * parameter.windX + parameter.windY * parameter.windY);
            var L = parameter.windSpeed * parameter.windSpeed * wlength / parameter.g;
            var kx = parameter.Kx / knormalized;
            var ky = parameter.Ky / knormalized;
            var windkdot = kx * parameter.windX / wlength + ky * parameter.windY / wlength;
            if (windkdot == 0.0)
                return 0.0;
            var result = parameter.A / (knormalized * knormalized * knormalized * knormalized) * Math.exp(-1.0 / (knormalized * knormalized * L * L))
                * windkdot * windkdot * windkdot * windkdot;
            return result;
        };
        Phillips.prototype.calculateH0 = function (input) {
            var t = this.randomBM();
            return new Ocean.Complex(1.0 / Math.sqrt(2.0) * this.randomBM() * Math.sqrt(input), 1.0 / Math.sqrt(2.0) * this.randomBM() * Math.sqrt(input));
        };
        Phillips.prototype.randomBM = function () {
            var u = 1.0 - Math.random();
            var v = 1.0 - Math.random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };
        return Phillips;
    }());
    Ocean.Phillips = Phillips;
})(Ocean || (Ocean = {}));
var Ocean;
(function (Ocean) {
    var Texture = (function () {
        function Texture(gl, size) {
            this.gl = gl;
            this.size = size;
            this.lambda = 0.8;
            this.displacementTexture = this.gl.createTexture();
            this.normalTextures = this.gl.createTexture();
            this.plot = new Ocean.Plot("spacial", 64);
        }
        Texture.prototype.texture = function (array0, array1, array2) {
            var dataArray = [];
            var k = 0, h = 0;
            var signs = [1.0, -1.0];
            for (var i = 0; i < this.size; i++) {
                for (var j = 0; j < this.size; j++) {
                    var sign = signs[(i + j) & 1];
                    dataArray[k] = array0[i][j] * (this.lambda) * sign;
                    dataArray[k + 1] = array1[i][j] * sign;
                    dataArray[k + 2] = array2[i][j] * (this.lambda) * sign;
                    dataArray[k + 3] = 1.0;
                    this.plot.imagedata.data[h] = dataArray[k] * 255.0 * 10;
                    this.plot.imagedata.data[h + 1] = dataArray[k + 1] * 255.0 * 10;
                    this.plot.imagedata.data[h + 2] = dataArray[k + 2] * 255.0 * 10;
                    this.plot.imagedata.data[h + 3] = 255.0;
                    h += 4;
                    k += 4;
                }
            }
            this.plot.load();
            return this.createTexturefromData(dataArray);
        };
        Texture.prototype.createTexturefromData = function (dataArray) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.displacementTexture);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, this.size, this.size, 0, this.gl.RGBA, this.gl.FLOAT, new Float32Array(dataArray));
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            return this;
        };
        Texture.prototype.createTexture = function (callback) {
            /*let image = new Image(512,512);
            let texture = this.gl.createTexture();

            

            image.addEventListener("load", ()=>{
               
               this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
               
               this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
               this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
               this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
               this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
               
               
               this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,  this.gl.RGBA, this.gl.UNSIGNED_BYTE,<HTMLImageElement> image);

               this.gl.bindTexture(this.gl.TEXTURE_2D, null);
               callback(texture);

            }, false);

            image.src = "images/Skybox2.jpg";*/
        };
        return Texture;
    }());
    Ocean.Texture = Texture;
})(Ocean || (Ocean = {}));
var Ocean;
(function (Ocean) {
    var SkyBox = (function (_super) {
        __extends(SkyBox, _super);
        function SkyBox(gl, size) {
            var _this = this;
            _super.call(this, gl);
            this.gl = gl;
            this.size = size;
            this.indices = [];
            new Ocean.Texture(this.gl, 512).createTexture(function (texture) {
                _this.texture = texture;
            });
            _super.prototype.createProgram.call(this, "skyBoxVertexShader", "skyBoxfragmentShader", false);
        }
        SkyBox.prototype.create = function () {
            var vertices = [-1, -1, -1, 0.25, 2.0 / 3.0,
                -1, -1, 1, 0.25, 1.0,
                1, -1, 1, 0.5, 1.0,
                1, -1, -1, 0.5, 2.0 / 3.0,
                -1, 1, -1, 0.25, 1.0 / 3.0,
                -1, 1, 1, 0.25, 0.0,
                1, 1, 1, 0.5, 0.0,
                1, 1, -1, 0.5, 1.0 / 3.0,
                -1, -1, -1, 0.25, 2.0 / 3.0,
                -1, 1, -1, 0.25, 1.0 / 3.0,
                1, 1, -1, 0.5, 1.0 / 3.0,
                1, -1, -1, 0.5, 2.0 / 3.0,
                -1, -1, 1, 1.0, 2.0 / 3.0,
                -1, 1, 1, 1.0, 1.0 / 3.0,
                1, 1, 1, 0.75, 1.0 / 3.0,
                1, -1, 1, 0.75, 2.0 / 3.0,
                1, -1, -1, 0.5, 2.0 / 3.0,
                1, 1, -1, 0.5, 1.0 / 3.0,
                1, 1, 1, 0.75, 1.0 / 3.0,
                1, -1, 1, 0.75, 2.0 / 3.0,
                -1, -1, -1, 0.25, 2.0 / 3.0,
                -1, 1, -1, 0.25, 1.0 / 3.0,
                -1, 1, 1, 0.0, 1.0 / 3.0,
                -1, -1, 1, 0.0, 2.0 / 3.0];
            this.indices = [0, 1, 2, 2, 3, 0,
                4, 5, 6, 6, 7, 4,
                8, 9, 10, 10, 11, 8,
                12, 13, 14, 14, 15, 12,
                16, 17, 18, 18, 19, 16,
                20, 21, 22, 22, 23, 20];
            this.gl.useProgram(this.program);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), this.gl.STATIC_DRAW);
            this.gl.useProgram(null);
        };
        SkyBox.prototype.render = function (projMatrix, viewMatrix, isclipped, isReflection) {
            this.gl.useProgram(this.program);
            if (isReflection)
                this.gl.uniform4f(this.program.clipPlane, 0, 1, 0, 1.0);
            else
                this.gl.uniform4f(this.program.clipPlane, 0, -1, 0, 1.0);
            if (isclipped)
                this.gl.uniform1f(this.program.isclipped, 1.0);
            else
                this.gl.uniform1f(this.program.isclipped, 0.0);
            this.gl.uniformMatrix4fv(this.program.projectionMatrix, false, projMatrix);
            this.gl.uniformMatrix4fv(this.program.viewMatrixMatrix, false, viewMatrix);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.enableVertexAttribArray(this.program.vertexPositionAttribute);
            this.gl.vertexAttribPointer(this.program.vertexPositionAttribute, 3, this.gl.FLOAT, false, 20, 0);
            this.gl.vertexAttribPointer(this.program.texcoord, 2, this.gl.FLOAT, false, 20, 12);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.depthMask(false);
            this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_BYTE, 0);
            this.gl.depthMask(true);
            this.gl.useProgram(null);
        };
        return SkyBox;
    }(Ocean.Buffer));
    Ocean.SkyBox = SkyBox;
})(Ocean || (Ocean = {}));
/*declare var mat4: any;
declare var vec3: any;

namespace Ocean
{
    export class Scene
    {
        gl: WebGLRenderingContext;
        canvas: HTMLCanvasElement;

        projMatrix: any;
        viewMatrix: any;

        frameNumber: number;
        skybox:SkyBox;
        ext: ANGLE_instanced_arrays;


        constructor(gl, canvas)
        {
            this.gl = gl;
            this.canvas = canvas;
            this.projMatrix = mat4.create();
            this.viewMatrix = mat4.create();

            this.frameNumber = 0;
            this.ext          = this.gl.getExtension("ANGLE_instanced_arrays");
            this.skybox = new SkyBox(gl, 100);
        }

        public load()
        {
            debugger;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.gl.clearColor(0.0, 0.3, 0.5, 1.0);

            this.gl.clearDepth(1);
            this.gl.enable(this.gl.DEPTH_TEST);

            mat4.perspective(65.0, 1.0, 0.1, 4000.0, this.projMatrix);
            mat4.lookAt(vec3.create([400,300,400]), vec3.create([0,0,0]), vec3.create([0,1,0]), this.viewMatrix);
            
            this.skybox.create();

        }

        public render()
        {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            this.skybox.render(this.projMatrix, this.viewMatrix);
            
            this.frameNumber = requestAnimationFrame(()=> {
                this.render();
            });
        }
    }
}

window.onload = () => {
   
    let canvas = <HTMLCanvasElement> document.getElementById('canvas');
    let gl     = <WebGLRenderingContext> canvas.getContext('webgl');

    var scene = new Ocean.Scene(gl, canvas);
    scene.load();
    scene.render();
}*/ 
var Ocean;
(function (Ocean) {
    var Camera = (function () {
        function Camera(position0, lookAt0, up0) {
            this.position = vec3.create(position0);
            this.lookAt = vec3.create(lookAt0);
            this.up = vec3.create(up0);
            this.angle = -1.035;
            this.pitch = 2.17;
            this.speed = 0.25;
        }
        Camera.prototype.moveForward = function () {
            vec3.add(this.position, [this.speed * Math.cos(this.angle) * Math.sin(this.pitch), this.speed * Math.cos(this.pitch), this.speed * Math.sin(this.angle) * Math.sin(this.pitch)], this.position);
            vec3.add(this.position, [Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
        };
        Camera.prototype.moveBackward = function () {
            vec3.add(this.position, [-this.speed * Math.cos(this.angle) * Math.sin(this.pitch), -this.speed * Math.cos(this.pitch), -this.speed * Math.sin(this.angle) * Math.sin(this.pitch)], this.position);
            vec3.add(this.position, [Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
        };
        Camera.prototype.moveUp = function () {
            vec3.add(this.position, [0, this.speed, 0], this.position);
            vec3.add(this.lookAt, [0, this.speed, 0], this.lookAt);
        };
        Camera.prototype.moveDown = function () {
            vec3.add(this.position, [0, -this.speed, 0], this.position);
            vec3.add(this.lookAt, [0, -this.speed, 0], this.lookAt);
        };
        Camera.prototype.lookRight = function () {
            this.angle += 0.05;
            vec3.add(this.position, [Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
        };
        Camera.prototype.lookLeft = function () {
            this.angle -= 0.05;
            vec3.add(this.position, [Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
        };
        Camera.prototype.lookUp = function () {
            this.pitch += 0.05;
            vec3.add(this.position, [Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
        };
        Camera.prototype.lookDown = function () {
            this.pitch -= 0.05;
            vec3.add(this.position, [Math.cos(this.angle) * Math.sin(this.pitch), Math.cos(this.pitch), Math.sin(this.angle) * Math.sin(this.pitch)], this.lookAt);
        };
        Camera.prototype.invertPitch = function () {
            this.pitch = -this.pitch;
        };
        Camera.prototype.log = function () {
            console.log(this.position);
            console.log(this.lookAt);
            console.log(this.angle);
            console.log(this.pitch);
        };
        return Camera;
    }());
    Ocean.Camera = Camera;
})(Ocean || (Ocean = {}));
var Ocean;
(function (Ocean) {
    var Plot = (function () {
        function Plot(id, size) {
            this.canvas = document.createElement('canvas');
            this.canvas.width = 64;
            this.canvas.height = 64;
            this.img = document.getElementById(id);
            this.ctx = this.canvas.getContext('2d');
            this.imagedata = this.ctx.createImageData(size, size);
        }
        Plot.prototype.load = function () {
            this.ctx.putImageData(this.imagedata, 0, 0);
            this.ctx.scale(4.0, 4.0);
            var src = this.canvas.toDataURL("image/png");
            this.img.src = src;
        };
        return Plot;
    }());
    Ocean.Plot = Plot;
})(Ocean || (Ocean = {}));
var Ocean;
(function (Ocean) {
    var FrameBuffer = (function () {
        function FrameBuffer(width, height, gl) {
            this.width = width;
            this.height = height;
            this.distance = 0;
            this.gl = gl;
            this.texture = gl.createTexture();
            this.framBuffer = this.gl.createFramebuffer();
            this.renderbuffer = this.gl.createRenderbuffer();
        }
        FrameBuffer.prototype.InitEmptyTexture = function () {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 512, 512, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        };
        FrameBuffer.prototype.CreateFrameBuffer = function () {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framBuffer);
            this.InitEmptyTexture();
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderbuffer);
            this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, 512, 512);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);
            this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.renderbuffer);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        };
        FrameBuffer.prototype.BeginRenderframeBuffer = function () {
            this.gl.viewport(0, 0, 512, 512);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framBuffer);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        };
        FrameBuffer.prototype.EndRenderBuffer = function () {
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.viewport(0, 0, this.width, this.height);
        };
        return FrameBuffer;
    }());
    Ocean.FrameBuffer = FrameBuffer;
})(Ocean || (Ocean = {}));