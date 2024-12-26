import vertexShaderSource from "./shader/vshader.glsl?raw";
import fragmentShaderSource from "./shader/fshader.glsl?raw";


class Renderer
{
  private canvas : HTMLCanvasElement;
  private gl : WebGL2RenderingContext;
  private program : WebGLProgram;
  private texture : WebGLTexture;

  constructor(){

    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true); // flip textur/*  */e

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);

    this.texture = this.loadTexture("assets/texture-mapping-test-image.jpg");

    const buffer = this.createArrayBuffer(new Float32Array([
            
     // x    y     s  t  r  g  b 
      -0.5, -0.5,  0, 0, 1, 1, 1,     // left bottom
      -0.5, 0.5,   0, 1, 1, 1, 1,     // left top
      0.5, -0.5,   1, 0, 1, 1, 1,     // right bottom
      0.5, 0.5,    1, 1, 1, 1, 1,     // right top
    ])); 

    const stride = 2 * Float32Array.BYTES_PER_ELEMENT + 2*Float32Array.BYTES_PER_ELEMENT + 3*Float32Array.BYTES_PER_ELEMENT;

    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, stride, 0);
    this.gl.enableVertexAttribArray(0);

    this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, stride, 2*Float32Array.BYTES_PER_ELEMENT);
    this.gl.enableVertexAttribArray(1);

    this.gl.vertexAttribPointer(2, 3, this.gl.FLOAT, false, stride, 4*Float32Array.BYTES_PER_ELEMENT);
    this.gl.enableVertexAttribArray(2);

    const indexBuffer = this.createIndexBuffer (new Uint8Array([
      0,1,2,
      2,1,3
    ]));
  }


  private loadTexture(uri: string) : WebGLTexture {
    const texture = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    this.gl.texImage2D(this.gl.TEXTURE_2D, //placeholder until image is loaded
      0,
      this.gl.RGBA,
      1, // width of texture
      1, //hight of texture
      0, // border
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      new Uint8Array([255,0,0,0,255])
    );

    const image = new Image();
    image.onload = () => {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            image);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

    }
    image.src = uri;

    return texture;
  
  }


  /**
   * create a webgl program
   * @param vertexShader vertex shader
   * @param fragmentShader fragment shader
   * @returns {WebGLProgram}
   */
  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram{
    
    const program = this.gl.createProgram();
    this.gl.attachShader(program,vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    const sucess = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);

    if(!sucess){

      console.error("program failed to link:" + this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);

    }

    return program;
  }


  /**
   * create a shader 
   * @param type = gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @param shaderSource shader source as string
   * @returns {WebGLShader}
  */
  private createShader(type: number, shaderSource: string) : WebGLShader {
    
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader,shaderSource);
    this.gl.compileShader(shader);

    const sucess = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);

    if (!sucess){

      console.error("program failed to compile:" + this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);

    }
    return shader
  }


  /**
   * create a buffer to store data to the gpu
   * @param data data to store
   * @returns {WebGLBuffer}
   */
  private createArrayBuffer(data : Float32Array): WebGLBuffer{

    const buffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

    return buffer;
  }
//create a Buffer to store indexes of vertecies rather than storing them for each triangle
  private createIndexBuffer(data: Uint8Array|Uint16Array|Uint32Array): WebGLBuffer{
    const buffer = this.gl.createBuffer()!;
  this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

    return buffer;
  }

  public draw(){
    this.gl.clearColor(0.5,0.5,0.5,1.0); //background color
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_BYTE,0); //draw triangle


    //start game loop draw texture  calls draw 60 times per second
    window.requestAnimationFrame(() => this.draw());
  }

}

const renderer = new Renderer();
renderer.draw();