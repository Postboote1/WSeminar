import { mat4 } from 'gl-matrix';

export class Camera {
    // Projection matrix for defining the view volume
    private projection!: mat4;
    
    // View matrix for camera positioning and orientation
    private view!: mat4;

    // Combined projection-view matrix for transforming vertices
    public projectionViewMatrix: mat4;

    /**
     * Constructor for Camera class
     * @param width Width of the rendering canvas
     * @param height Height of the rendering canvas
     */
    constructor(public width: number, public height: number) 
    {
        // Initialize projection-view matrix
        this.projectionViewMatrix = mat4.create();
    }

    /**
     * Update camera matrices
     * Creates an orthographic projection and a view matrix
     */
    public update() 
    {
        // Create orthographic projection matrix
        // Parameters: output matrix, left, right, bottom, top, near, far
        // In this case, (0,width) horizontal, (height,0) vertical to match canvas coordinates
        this.projection = mat4.ortho(mat4.create(), 0, this.width, this.height, 0, -1, 1)
        
        // Create view matrix
        // Parameters: output matrix, eye position, target, up vector
        // Here it sets camera at (0,0,1) looking at (0,0,0) with Y-axis up
        this.view = mat4.lookAt(mat4.create(), [0, 0, 1], [0, 0, 0], [0, 1, 0]);

        // Multiply projection and view matrices to get combined transformation
        mat4.mul(this.projectionViewMatrix, this.projection, this.view);
    }
}