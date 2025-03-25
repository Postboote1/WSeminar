import { Engine } from "./engine";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth - 250; // Subtract control panel width
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth - 250;
    canvas.height = window.innerHeight;
});

const renderer = new Engine();

renderer.initialize().then(() => {
    renderer.draw();
});
