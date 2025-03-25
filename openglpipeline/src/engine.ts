import { vec2 } from "gl-matrix";
import { Content } from "./content";
import { Rect } from "./rect";
import { SpriteRenderer } from "./sprite-renderer";
import { Color } from "./color";
import { Sprite } from "./sprite";

interface RenderableSprite {
    sprite: Sprite;
    x: number;
    y: number;
    rotation: number;
    rotationOrigin: vec2;
    rotationSpeed: number;
}

export class Engine {
    private canvas!: HTMLCanvasElement;
    private gl!: WebGL2RenderingContext;
    
    private spriteRenderer!: SpriteRenderer;
    private renderableSprites: RenderableSprite[] = [];

    // FPS tracking
    private fpsCounter: HTMLElement;
    private frameCount = 0;
    private lastFpsUpdate = 0;

    constructor() {
        this.setupEventListeners();
        this.fpsCounter = document.getElementById('fps-counter')!;
    }

    private setupEventListeners() {
        document.getElementById('addSpriteBtn')?.addEventListener('click', () => this.addSprite());
        document.getElementById('clearSpritesBtn')?.addEventListener('click', () => this.clearSprites());
        document.getElementById('performanceTestBtn')?.addEventListener('click', () => this.runPerformanceTest());
    }

    private runPerformanceTest() {
        this.clearSprites();
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const spriteNames = Object.keys(Content.sprites);

        for (let i = 0; i < 10000; i++) {
            // Randomly select a sprite
            const spriteName = spriteNames[Math.floor(Math.random() * spriteNames.length)];
            const sprite = Content.sprites[spriteName];

            // Random position
            const x = Math.random() * (canvasWidth - sprite.drawRect.width);
            const y = Math.random() * (canvasHeight - sprite.drawRect.height);

            // Random rotation speed
            const rotationSpeed = (Math.random() - 0.5) * 0.2;

            this.renderableSprites.push({
                sprite,
                x,
                y,
                rotation: 0,
                rotationOrigin: vec2.fromValues(0.5, 0.5),
                rotationSpeed
            });
        }
    }

    private addSprite() {
        const spriteSelector = document.getElementById('spriteSelector') as HTMLSelectElement;
        const xPositionInput = document.getElementById('xPosition') as HTMLInputElement;
        const yPositionInput = document.getElementById('yPosition') as HTMLInputElement;
        const rotationSpeedInput = document.getElementById('rotationSpeed') as HTMLInputElement;
        const rotationOriginSelect = document.getElementById('rotationOrigin') as HTMLSelectElement;

        const spriteName = spriteSelector.value;
        const sprite = Content.sprites[spriteName];
        
        let rotationOrigin: vec2;
        switch(rotationOriginSelect.value) {
            case 'topLeft':
                rotationOrigin = vec2.fromValues(0, 0);
                break;
            case 'bottomRight':
                rotationOrigin = vec2.fromValues(1, 1);
                break;
            default:
                rotationOrigin = vec2.fromValues(0.5, 0.5);
        }

        this.renderableSprites.push({
            sprite,
            x: parseFloat(xPositionInput.value),
            y: parseFloat(yPositionInput.value),
            rotation: 0,
            rotationOrigin,
            rotationSpeed: parseFloat(rotationSpeedInput.value)
        });
    }

    private clearSprites() {
        this.renderableSprites = [];
    }

    public async initialize() {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl2", {
            alpha: false,
        })!;
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

        await Content.initialize(this.gl);

        this.spriteRenderer = new SpriteRenderer(this.gl, this.canvas.width, this.canvas.height);
        await this.spriteRenderer.initialize();
    }

    public draw(timestamp: number): void {
        // FPS Calculation
        this.frameCount++;
        if (timestamp >= this.lastFpsUpdate + 1000) {
            const fps = this.frameCount;
            this.fpsCounter.textContent = `FPS: ${fps}`;
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
        }

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.8, 0.8, 0.8, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.spriteRenderer.begin();

        this.renderableSprites.forEach(renderableSprite => {
            const { sprite, x, y, rotation, rotationOrigin, rotationSpeed } = renderableSprite;
            
            sprite.drawRect.x = x;
            sprite.drawRect.y = y;

            renderableSprite.rotation += rotationSpeed;

            this.spriteRenderer.drawSpriteSource(
                sprite.texture,
                sprite.drawRect,
                sprite.sourceRect,
                undefined,
                renderableSprite.rotation,
                rotationOrigin
            );
        });

        this.spriteRenderer.end();

        // start game loop 
        window.requestAnimationFrame((ts) => this.draw(ts));
    }
}