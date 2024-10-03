import vertexShaderSource from "./shader/vshader.glsl?raw";
import fragmentShaderSource from "./shader/fshader.glsl?raw";


class Renderer
{
  private canvas : HTMLCanvasElement;
  private gl : WebGL2RenderingContext;
  private program : WebGLProgram;

  constructor(){

    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);

    this.createBuffer([ // create Buffer for location of vertecies
      -0.5, -0.5,
      -0.5, 0.5,
      0.5, -0.5,
    ])

    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);

    this.createBuffer([// create Buffer for color
      1,0,0,
      0,1,0,
      0,0,1
    ]);

    this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(1);
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
  private createBuffer(data : number[]): WebGLBuffer{

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);

    return buffer;
  }

  public draw(){
    this.gl.clearColor(0.5,0.5,0.5,1.0); //background color
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)//draw triangle
  }

}

const renderer = new Renderer();
renderer.draw();