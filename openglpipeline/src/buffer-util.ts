export class BufferUtil {
    /**
     * Creates a WebGL array buffer to store vertex data.
     * 
     * @param gl - The WebGL rendering context
     * @param data - A Float32Array containing vertex data to be stored in the buffer
     * @returns A WebGLBuffer containing the vertex data
     * 
     * This method is used to create buffers for storing vertex attributes like 
     * positions, texture coordinates, or colors. The STATIC_DRAW parameter 
     * indicates the data will not change frequently.
     */
    public static createArrayBuffer(gl: WebGL2RenderingContext, data: Float32Array): WebGLBuffer {
        const buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        return buffer;
    }

    /**
     * Creates a WebGL index buffer to define vertex drawing order.
     * 
     * @param gl - The WebGL rendering context
     * @param data - An array of indices (Uint8Array, Uint16Array, or Uint32Array) 
     *               specifying the order of vertices to draw
     * @returns A WebGLBuffer containing the index data
     * 
     * Index buffers are used to reuse vertex data and reduce memory usage by 
     * specifying which vertices should be drawn and in what order. This is 
     * particularly useful for rendering complex shapes or optimizing rendering.
     */
    public static createIndexBuffer(gl: WebGL2RenderingContext, data: Uint8Array | Uint16Array | Uint32Array): WebGLBuffer {
        const buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

        return buffer;
    }
}