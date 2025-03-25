import { Engine } from "./engine";
import { Content } from "./content";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth - 250; // Subtract control panel width
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth - 250;
    canvas.height = window.innerHeight;
});

const renderer = new Engine();

renderer.initialize().then(() => {
    renderer.draw(performance.now());
    
    // Populate sprite selector
    const spriteSelector = document.getElementById('spriteSelector') as HTMLSelectElement;
    const sprites = Object.keys(Content.sprites);
    
    sprites.forEach(spriteName => {
        const option = document.createElement('option');
        option.value = spriteName;
        option.textContent = spriteName;
        spriteSelector.appendChild(option);
    });
});
