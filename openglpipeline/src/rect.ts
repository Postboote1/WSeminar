export class Rect 
{
    /**
     * Represents a rectangular area with position and dimensions.
     * 
     * @param x - X-coordinate of the top-left corner
     * @param y - Y-coordinate of the top-left corner
     * @param width - Width of the rectangle
     * @param height - Height of the rectangle
     * 
     * This class is used for:
     * 1. Defining sprite draw areas
     * 2. Specifying source regions in sprite sheets
     * 3. Positioning and sizing elements in the rendering pipeline
     */
    constructor(
        public x: number,      // X position of top-left corner
        public y: number,      // Y position of top-left corner
        public width: number,  // Width of the rectangle
        public height: number  // Height of the rectangle
    ) {
        // No additional logic needed in constructor
    }
}