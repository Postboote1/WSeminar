export class Color 
{
    /**
     * Represents an RGB color with values between 0 and 1.
     * 
     * @param r - Red color component (default: 1)
     * @param g - Green color component (default: 1)
     * @param b - Blue color component (default: 1)
     * 
     * This class is used to define colors for sprites and rendering.
     * By default, it creates a white color (all components at 1).
     * Color values are normalized to the range [0, 1] for WebGL.
     */
    constructor(
        public r: number = 1,  // Red component 
        public g: number = 1,  // Green component
        public b: number = 1   // Blue component
    ) {
        // Optional: Could add validation to ensure values are between 0 and 1
    }
}