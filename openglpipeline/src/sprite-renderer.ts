import { BufferUtil } from "./buffer-util";
import { Camera } from "./camera";
import { ProgramUtil } from "./program-util";
import { Rect } from "./rect";
import { Texture } from "./texture";
import vertexShaderSource from "./shader/vshader.glsl?raw";
import fragmentShaderSource from "./shader/fshader.glsl?raw";
import { Color } from "./color";
import { vec2 } from "gl-matrix";

// Constants for sprite rendering optimization
const MAX_NUMBER_OF_SPRITES = 1000;     // Maximum number of sprites that can be rendered in a single batch
const FLOATS_PER_VERTEX = 7;             // Number of float values per vertex (x, y, u, v, r, g, b)
const FLOATS_PER_SPRITE = 4 * FLOATS_PER_VERTEX; // Total float values for a sprite (4 vertices)
const INDICES_PER_SPRITE = 6;            // Number of indices needed to render a sprite (2 triangles)

/**
 * SpriteRenderer handles efficient 2D sprite rendering using WebGL
 * It uses instanced rendering with a pre-allocated buffer to minimize draw calls
 */
export class SpriteRenderer {
    // Tracks the number of sprites currently in the rendering batch
    private instanceCount = 0;
    
    // Keeps track of the current texture to minimize texture switches
    private currentTexture: Texture | null = null;
    
    // Default color for sprites (white)
    private defaultColor = new Color();

    // WebGL-specific rendering components
    private projectionViewMatrixLocation!: WebGLUniformLocation;
    private camera!: Camera;
    private buffer!: WebGLBuffer;
    private indexBuffer!: WebGLBuffer;
    
    // Pre-allocated float array to store sprite vertex data
    private data: Float32Array = new Float32Array(FLOATS_PER_SPRITE * MAX_NUMBER_OF_SPRITES);
    private program!: WebGLProgram;

    // Temporary vectors for vertex manipulation (rotation, positioning)
    private v0: vec2 = vec2.create();
    private v1: vec2 = vec2.create();
    private v2: vec2 = vec2.create();
    private v3: vec2 = vec2.create();
    private _rotationOrigin = vec2.create();

    /**
     * Constructor for SpriteRenderer
     * @param gl WebGL rendering context
     * @param width Canvas width
     * @param height Canvas height
     */
    constructor(private gl: WebGL2RenderingContext,
        private width: number, private height: number) {
    }

    /**
     * Sets up the index buffer for efficient sprite rendering
     * Creates a pre-calculated index buffer to minimize GPU work
     */
    private setupIndexBuffer() {
        // Creates indices for rendering sprites as two triangles
        const data = new Uint16Array(MAX_NUMBER_OF_SPRITES * INDICES_PER_SPRITE);

        for(let i = 0; i < MAX_NUMBER_OF_SPRITES; i++) {
            // First triangle
            data[i * INDICES_PER_SPRITE + 0] = i * 4 + 0;
            data[i * INDICES_PER_SPRITE + 1] = i * 4 + 1;
            data[i * INDICES_PER_SPRITE + 2] = i * 4 + 3;

            // Second triangle
            data[i * INDICES_PER_SPRITE + 3] = i * 4 + 1;
            data[i * INDICES_PER_SPRITE + 4] = i * 4 + 2;
            data[i * INDICES_PER_SPRITE + 5] = i * 4 + 3;
        }

        this.indexBuffer = BufferUtil.createIndexBuffer(this.gl, data);
    }

    /**
     * Initializes the sprite renderer
     * - Sets up camera
     * - Compiles shaders
     * - Creates WebGL program
     * - Sets up vertex attributes
     */
    public async initialize() {
        this.camera = new Camera(this.width, this.height);

        // Compile vertex and fragment shaders
        const vertexShader = ProgramUtil.createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = ProgramUtil.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        // Create and link WebGL program
        this.program = ProgramUtil.createProgram(this.gl, vertexShader, fragmentShader);
        this.projectionViewMatrixLocation = this.gl.getUniformLocation(this.program, "projectionViewMatrix")!;

        this.gl.useProgram(this.program);

        // Create vertex buffer
        this.buffer = BufferUtil.createArrayBuffer(this.gl, this.data);

        // Calculate stride for interleaved vertex data
        const stride = 2 * Float32Array.BYTES_PER_ELEMENT + 2 * Float32Array.BYTES_PER_ELEMENT + 3 * Float32Array.BYTES_PER_ELEMENT;

        // Set up vertex attributes (position, texture coordinates, color)
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, stride, 0);
        this.gl.enableVertexAttribArray(0);

        this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
        this.gl.enableVertexAttribArray(1);

        this.gl.vertexAttribPointer(2, 3, this.gl.FLOAT, false, stride, 4 * Float32Array.BYTES_PER_ELEMENT);
        this.gl.enableVertexAttribArray(2);

        this.setupIndexBuffer();
    }

    /**
     * Begins a new rendering batch
     * - Resets instance count
     * - Updates camera
     * - Sets up blending
     * - Binds program and buffers
     */
    public begin() {
        this.instanceCount = 0;
        this.camera.update();

        // Enable alpha blending
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.useProgram(this.program);
        this.gl.uniformMatrix4fv(this.projectionViewMatrixLocation, false, this.camera.projectionViewMatrix);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }

    /**
     * Draws a sprite with optional rotation and color
     * @param texture Sprite texture
     * @param rect Destination rectangle
     * @param color Sprite color (default white)
     * @param rotation Rotation angle
     * @param rotationOrigin Rotation pivot point
     */
    public drawSprite(texture: Texture, rect: Rect, color: Color = this.defaultColor, rotation = 0, rotationOrigin: vec2|null = null) {
        // Flush and switch texture if needed
        if(this.currentTexture != texture){
            this.end();
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture.texture);
            this.currentTexture = texture;
        }
        let i = this.instanceCount * FLOATS_PER_SPRITE;

        // Prepare vertex positions
        this.v0[0] = rect.x;
        this.v0[1] = rect.y;
        this.v1[0] = rect.x + rect.width;
        this.v1[1] = rect.y;
        this.v2[0] = rect.x + rect.width;
        this.v2[1] = rect.y + rect.height;
        this.v3[0] = rect.x;
        this.v3[1] = rect.y + rect.height;

        // Apply rotation if needed
        if(rotation != 0) {
            this._rotationOrigin[0] = rect.x;
            this._rotationOrigin[1] = rect.y;

            if(rotationOrigin != null) {
                this._rotationOrigin[0] += rect.width * rotationOrigin[0];
                this._rotationOrigin[1] += rect.height * rotationOrigin[1];
            }
            
            // Rotate vertices around specified origin
            vec2.rotate(this.v0, this.v0, this._rotationOrigin, rotation);
            vec2.rotate(this.v1, this.v1, this._rotationOrigin, rotation);
            vec2.rotate(this.v2, this.v2, this._rotationOrigin, rotation);
            vec2.rotate(this.v3, this.v3, this._rotationOrigin, rotation);
        }


        // top left 
        this.data[0 + i] = this.v0[0]; // x 
        this.data[1 + i] = this.v0[1]; // y 
        this.data[2 + i] = 0;      // u
        this.data[3 + i] = 1;      // v
        this.data[4 + i] = color.r;      // r
        this.data[5 + i] = color.g;      // g
        this.data[6 + i] = color.b;      // b

        // top right
        this.data[7 + i] = this.v1[0]; // x
        this.data[8 + i] = this.v1[1];              // y
        this.data[9 + i] = 1;                   // u
        this.data[10 + i] = 1;                  // v
        this.data[11 + i] = color.r;                  // r
        this.data[12 + i] = color.g;                  // g
        this.data[13 + i] = color.b;                  // b

        // bottom right
        this.data[14 + i] = this.v2[0]; // x
        this.data[15 + i] = this.v2[1]; // y
        this.data[16 + i] = 1;                   // u
        this.data[17 + i] = 0;                   // v
        this.data[18 + i] = color.r;                   // r
        this.data[19 + i] = color.g;                   // g
        this.data[20 + i] = color.b;                   // b

        // bottom left
        this.data[21 + i] = this.v3[0]; // x
        this.data[22 + i] = this.v3[1]; // y
        this.data[23 + i] = 0;                   // u
        this.data[24 + i] = 0;                   // v
        this.data[25 + i] = color.r;                   // r
        this.data[26 + i] = color.g;                   // g
        this.data[27 + i] = color.b;                   // b

        this.instanceCount++;

        // Flush batch if max sprites reached
        if(this.instanceCount >= MAX_NUMBER_OF_SPRITES){
             this.end();
        }
    }

    /**
     * Draws a sprite with source rectangle (for sprite sheets)
     * Similar to drawSprite, but allows specifying exact texture coordinates
     */
    public drawSpriteSource(texture: Texture, rect: Rect, sourceRect: Rect, 
        color: Color = this.defaultColor, rotation = 0, rotationOrigin: vec2|null = null) {

        if(this.currentTexture != texture){
            
            this.end();
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture.texture);
            this.currentTexture = texture;
        }
        let i = this.instanceCount * FLOATS_PER_SPRITE;

        this.v0[0] = rect.x;
        this.v0[1] = rect.y;
        this.v1[0] = rect.x + rect.width;
        this.v1[1] = rect.y;
        this.v2[0] = rect.x + rect.width;
        this.v2[1] = rect.y + rect.height;
        this.v3[0] = rect.x;
        this.v3[1] = rect.y + rect.height;


        if(rotation != 0)
        {
            this._rotationOrigin[0] = rect.x;
            this._rotationOrigin[1] = rect.y;

            if(rotationOrigin != null)
            {
                this._rotationOrigin[0] += rect.width * rotationOrigin[0];
                this._rotationOrigin[1] += rect.height * rotationOrigin[1];
            }
            
            vec2.rotate(this.v0, this.v0, this._rotationOrigin, rotation);
            vec2.rotate(this.v1, this.v1, this._rotationOrigin, rotation);
            vec2.rotate(this.v2, this.v2, this._rotationOrigin, rotation);
            vec2.rotate(this.v3, this.v3, this._rotationOrigin, rotation);
        }

        let u0 = sourceRect.x / texture.width;
        let v0 = 1 - sourceRect.y / texture.height;
        let u1 = (sourceRect.x + sourceRect.width) / texture.width;
        let v1 = 1 - (sourceRect.y + sourceRect.height) / texture.height;

        // top left 
        this.data[0 + i] = this.v0[0]; // x 
        this.data[1 + i] = this.v0[1]; // y 
        this.data[2 + i] = u0;      // u
        this.data[3 + i] = v0;      // v
        this.data[4 + i] = color.r;      // r
        this.data[5 + i] = color.g;      // g
        this.data[6 + i] = color.b;      // b

        // top right
        this.data[7 + i] = this.v1[0]; // x
        this.data[8 + i] = this.v1[1];              // y
        this.data[9 + i] = u1;                   // u
        this.data[10 + i] = v0;                  // v
        this.data[11 + i] = color.r;                  // r
        this.data[12 + i] = color.g;                  // g
        this.data[13 + i] = color.b;                  // b

        // bottom right
        this.data[14 + i] = this.v2[0]; // x
        this.data[15 + i] = this.v2[1]; // y
        this.data[16 + i] = u1;                   // u
        this.data[17 + i] = v1;                   // v
        this.data[18 + i] = color.r;                   // r
        this.data[19 + i] = color.g;                   // g
        this.data[20 + i] = color.b;                   // b

        // bottom left
        this.data[21 + i] = this.v3[0]; // x
        this.data[22 + i] = this.v3[1]; // y
        this.data[23 + i] = u0;                   // u
        this.data[24 + i] = v1;                   // v
        this.data[25 + i] = color.r;                   // r
        this.data[26 + i] = color.g;                   // g
        this.data[27 + i] = color.b;                   // b

        this.instanceCount++;

        if(this.instanceCount >= MAX_NUMBER_OF_SPRITES){
             this.end();
        }
    }

    public end() {
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.data);
        this.gl.drawElements(this.gl.TRIANGLES, 6 * this.instanceCount, this.gl.UNSIGNED_SHORT, 0);
        this.instanceCount = 0;
    }
}