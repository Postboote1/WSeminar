/**
 * ProgramUtil provides static utility methods for creating and managing WebGL shaders and programs
 * Handles shader compilation and program linking
 */
export class ProgramUtil {
    /**
     * Creates a complete WebGL program by compiling and linking vertex and fragment shaders
     * @param gl WebGL rendering context
     * @param vertexShader Compiled vertex shader
     * @param fragmentShader Compiled fragment shader
     * @returns The linked WebGL program
     */
    public static createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
        // Create a new WebGL program
        const program = gl.createProgram()!;
        
        // Attach both shaders to the program
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // Link the program
        gl.linkProgram(program);

        // Check for linking errors
        const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            const programError = gl.getProgramInfoLog(program);
            console.warn("Program linking failed: " + programError);
        }

        return program;
    }

    /**
     * Compiles a shader from source code
     * @param gl WebGL rendering context
     * @param type Shader type (VERTEX_SHADER or FRAGMENT_SHADER)
     * @param source Shader source code
     * @returns The compiled WebGL shader
     */
    public static createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
        // Create a new shader of the specified type
        const shader = gl.createShader(type)!;

        // Set the shader source code
        gl.shaderSource(shader, source);
        
        // Compile the shader
        gl.compileShader(shader);

        // Check for compilation errors
        const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            const shaderError = gl.getShaderInfoLog(shader);
            console.warn("Shader compilation failed: " + shaderError);
        }

        return shader;
    }
}