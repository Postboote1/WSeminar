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

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        document.getElementById('addSpriteBtn')?.addEventListener('click', () => this.addSprite());
        document.getElementById('clearSpritesBtn')?.addEventListener('click', () => this.clearSprites());
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

    public draw(): void {
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
        window.requestAnimationFrame(() => this.draw());
    }
}