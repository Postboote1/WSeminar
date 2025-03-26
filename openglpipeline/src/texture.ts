/**
 * Texture represents a loaded WebGL texture with its dimensions
 * Provides a static method for asynchronously loading textures from image files
 */
export class Texture {
    /**
     * Creates a new Texture instance
     * @param texture The WebGL texture object
     * @param width Texture width in pixels
     * @param height Texture height in pixels
     */
    constructor(
        public texture: WebGLTexture,  // The actual WebGL texture object
        public width: number,           // Texture width
        public height: number           // Texture height
    ) {
        // Simple constructor storing texture and its dimensions
    }

    /**
     * Asynchronously loads a texture from an image file
     * @param gl WebGL rendering context
     * @param uri Path to the image file
     * @returns A Promise resolving to a Texture instance
     */
    public static async loadTexture(gl: WebGL2RenderingContext, uri: string): Promise<Texture> {
        return new Promise<Texture>((resolve, reject) => {
            const image = new Image();
            image.src = uri;

            image.onload = () => {
                // Create a new WebGL texture
                const texture = gl.createTexture()!;
                gl.bindTexture(gl.TEXTURE_2D, texture);

                // Load image data into WebGL texture
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,              // Mipmap level
                    gl.RGBA,        // Internal format
                    gl.RGBA,        // Source format
                    gl.UNSIGNED_BYTE, // Source type
                    image           // Image source
                );

                // Generate mipmaps for better rendering at different scales
                gl.generateMipmap(gl.TEXTURE_2D);

                // Resolve the promise with a new Texture instance
                resolve(new Texture(texture, image.width, image.height));
            }

            image.onerror = () => {
                // Handle image loading errors
                const msg = `Failed to load image ${uri}`;
                console.error(msg);
                alert(msg);
                reject();
            }
        });
    }
}