import { Engine } from "./engine";
import { Content } from "./content";

// Dynamically set canvas size to fill window minus control panel width
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth - 250; // Subtract control panel width
canvas.height = window.innerHeight;

// Adjust canvas size when window is resized
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth - 250;
    canvas.height = window.innerHeight;
});

// Create the main rendering engine
const renderer = new Engine();

// Initialize the renderer and set up the application
renderer.initialize().then(() => {
    // Start the render loop
    renderer.draw(performance.now());
    
    // Populate sprite selector dropdown with available sprites
    const spriteSelector = document.getElementById('spriteSelector') as HTMLSelectElement;
    const sprites = Object.keys(Content.sprites);
    
    sprites.forEach(spriteName => {
        const option = document.createElement('option');
        option.value = spriteName;
        option.textContent = spriteName;
        spriteSelector.appendChild(option);
    });
});

/**
 * Main entry point for the WebGL Sprite Renderer application
 * 
 * Key responsibilities:
 * 1. Set up canvas size responsively
 * 2. Create rendering engine
 * 3. Initialize content and renderer
 * 4. Start render loop
 * 5. Populate sprite selection dropdown
 */