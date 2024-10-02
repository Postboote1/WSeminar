import vertexShaderSource from "./shader/vshader.glsl?raw";
import fragmentShaderSource from "./shader/fshader.glsl?raw";


class Renderer
{
  private canvas : HTMLCanvasElement;
  private gl : WebGL2RenderingContext;
  private program : WebGL2RenderingContext;

  constructor(){

    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource)
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


  public render(){
    this.gl.clearColor(1.0,0.0,0.0,1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

  }

}

const renderer = new Renderer();
renderer.render();