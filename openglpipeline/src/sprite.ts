import { Rect } from "./rect";
import { Texture } from "./texture";

/**
 * Sprite represents a single renderable image with its associated texture and rectangles
 * Combines both the source (texture coordinates) and destination (screen position) rectangles
 */
export class Sprite {
    /**
     * Creates a new Sprite
     * @param texture The WebGL texture to render
     * @param drawRect The rectangle defining where the sprite will be drawn on screen
     * @param sourceRect The rectangle defining which part of the texture to use
     */
    constructor(
        public texture: Texture,  // The texture containing the sprite image
        public drawRect: Rect,    // Defines the sprite's position and size on screen
        public sourceRect: Rect   // Defines the sprite's region within the source texture
    ) {
        // Simple constructor that stores sprite rendering information
    }
}