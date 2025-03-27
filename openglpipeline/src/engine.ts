import { vec2, mat4 } from "gl-matrix";
import { Content } from "./content";
import { Rect } from "./rect";
import { SpriteRenderer } from "./sprite-renderer";
import { Color } from "./color";
import { Sprite } from "./sprite";

// Interface defining the structure of a renderable sprite
interface RenderableSprite {
    sprite: Sprite;          // The actual sprite to render
    position: vec2;          // Current position of the sprite
    rotation: number;        // Current rotation angle
    rotationOrigin: vec2;    // Point around which rotation occurs
    rotationSpeed: number;   // Speed of rotation
    movementSpeed: vec2;     // Current movement velocity
    isMovable: boolean;      // Whether the sprite can be moved by keyboard
    movementAngle: number;   // Angle of movement for auto-rotation
}

export class Engine {
    // Canvas and WebGL rendering context
    private canvas!: HTMLCanvasElement;
    private gl!: WebGL2RenderingContext;
    
    // Sprite rendering system
    private spriteRenderer!: SpriteRenderer;
    
    // Collection of all sprites to be rendered
    private renderableSprites: RenderableSprite[] = [];

    // FPS tracking elements
    private fpsCounter: HTMLElement;
    private frameCount = 0;
    private lastFpsUpdate = 0;

    // Keyboard input tracking
    private keysPressed: Set<string> = new Set();
    
    // Base movement speed for sprite movement
    private baseMovementSpeed = 5; // pixels per frame

    constructor() {
        // Set up user interface event listeners
        this.setupEventListeners();
        
        // Get reference to FPS display element
        this.fpsCounter = document.getElementById('fps-counter')!;
    }

    /**
     * Set up all event listeners for user interactions
     */
    private setupEventListeners() {
        // Existing button event listeners
        document.getElementById('addSpriteBtn')?.addEventListener('click', () => this.addSprite());
        document.getElementById('clearSpritesBtn')?.addEventListener('click', () => this.clearSprites());
        document.getElementById('performanceTestBtn')?.addEventListener('click', () => this.runPerformanceTest());

        // Keyboard event listeners for sprite movement
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Remove previous movement checkbox creation
        const controlsDiv = document.getElementById('controls');
        
        // Create a new button for enabling sprite movement
        const enableMovementBtn = document.createElement('button');
        enableMovementBtn.id = 'enableSpriteMovementBtn';
        enableMovementBtn.textContent = 'Enable Sprite Movement';
        enableMovementBtn.addEventListener('click', () => this.enableSpriteMovement());
        
        controlsDiv?.appendChild(enableMovementBtn);
    }

    /**
     * Handle key press events by adding to pressed keys set
     */
    private handleKeyDown(event: KeyboardEvent) {
        this.keysPressed.add(event.key.toLowerCase());
    }

    /**
     * Handle key release events by removing from pressed keys set
     */
    private handleKeyUp(event: KeyboardEvent) {
        this.keysPressed.delete(event.key.toLowerCase());
    }

    private enableSpriteMovement() {
        // Find the most recently added movable sprite
        const movableSprite = this.renderableSprites.findLast(sprite => !sprite.isMovable);
        
        if (movableSprite) {
            // Enable movement for this sprite
            movableSprite.isMovable = true;
            
            // Disable the movement button after enabling
            const enableMovementBtn = document.getElementById('enableSpriteMovementBtn') as HTMLButtonElement;
            enableMovementBtn.disabled = true;
        }
    }
    /**
     * Move sprites based on keyboard input
     */
    private moveSprites() {
        this.renderableSprites.forEach(renderableSprite => {
            // Skip non-movable sprites
            if (!renderableSprite.isMovable) return;

            // Reset movement speed
            renderableSprite.movementSpeed = vec2.fromValues(0, 0);

            // Handle horizontal movement
            if (this.keysPressed.has('arrowright')) {
                renderableSprite.movementSpeed[0] += this.baseMovementSpeed;
            }
            if (this.keysPressed.has('arrowleft')) {
                renderableSprite.movementSpeed[0] -= this.baseMovementSpeed;
            }

            // Handle vertical movement
            if (this.keysPressed.has('arrowup')) {
                renderableSprite.movementSpeed[1] -= this.baseMovementSpeed;
            }
            if (this.keysPressed.has('arrowdown')) {
                renderableSprite.movementSpeed[1] += this.baseMovementSpeed;
            }

            // Apply movement
            vec2.add(renderableSprite.position, renderableSprite.position, renderableSprite.movementSpeed);

            // Calculate movement angle for rotation
            if (renderableSprite.movementSpeed[0] !== 0 || renderableSprite.movementSpeed[1] !== 0) {
                renderableSprite.movementAngle = Math.atan2(
                    renderableSprite.movementSpeed[1], 
                    renderableSprite.movementSpeed[0]
                );
                
                // Set rotation to match movement direction
                renderableSprite.rotation = renderableSprite.movementAngle + Math.PI / 2;
            }

            // Constrain sprite to canvas boundaries
            renderableSprite.position[0] = Math.max(0, Math.min(
                renderableSprite.position[0], 
                this.canvas.width - renderableSprite.sprite.drawRect.width
            ));
            renderableSprite.position[1] = Math.max(0, Math.min(
                renderableSprite.position[1], 
                this.canvas.height - renderableSprite.sprite.drawRect.height
            ));
        });
    }

    /**
     * Run a performance test by adding 10,000 randomly placed sprites
     */
    private runPerformanceTest() {
        // Clear existing sprites
        this.clearSprites();
        
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const spriteNames = Object.keys(Content.sprites);

        // Create 10,000 sprites with random properties
        for (let i = 0; i < 10000; i++) {
            // Randomly select a sprite
            const spriteName = spriteNames[Math.floor(Math.random() * spriteNames.length)];
            const sprite = Content.sprites[spriteName];

            // Random position within canvas
            const x = Math.random() * (canvasWidth - sprite.drawRect.width);
            const y = Math.random() * (canvasHeight - sprite.drawRect.height);

            // Random rotation speed
            const rotationSpeed = (Math.random() - 0.5) * 0.2;

            this.renderableSprites.push({
                sprite,
                position: vec2.fromValues(x, y),
                rotation: 0,
                rotationOrigin: vec2.fromValues(0.5, 0.5),
                rotationSpeed,
                movementSpeed: vec2.create(),
                isMovable: false,
                movementAngle: 0
            });
        }
    }

    /**
     * Add a sprite to the scene based on user input
     */
    private addSprite() {
        // Get input values from UI
        const spriteSelector = document.getElementById('spriteSelector') as HTMLSelectElement;
        const xPositionInput = document.getElementById('xPosition') as HTMLInputElement;
        const yPositionInput = document.getElementById('yPosition') as HTMLInputElement;
        const rotationSpeedInput = document.getElementById('rotationSpeed') as HTMLInputElement;
        const rotationOriginSelect = document.getElementById('rotationOrigin') as HTMLSelectElement;

        // Get selected sprite
        const spriteName = spriteSelector.value;
        const sprite = Content.sprites[spriteName];
        
        // Determine rotation origin based on user selection
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

        // Enable the movement button
        const enableMovementBtn = document.getElementById('enableSpriteMovementBtn') as HTMLButtonElement;
        enableMovementBtn.disabled = false;

        // Add new renderable sprite to the collection
        this.renderableSprites.push({
            sprite,
            position: vec2.fromValues(
                parseFloat(xPositionInput.value), 
                parseFloat(yPositionInput.value)
            ),
            rotation: 0,
            rotationOrigin,
            rotationSpeed: parseFloat(rotationSpeedInput.value),
            movementSpeed: vec2.create(),
            isMovable: false,  // Set to false initially
            movementAngle: 0   // Add movement angle tracking
        });
    }

    /**
     * Remove all sprites from the scene
     */
    private clearSprites() {
        this.renderableSprites = [];
    }

    /**
     * Initialize the rendering engine
     */
    public async initialize() {
        // Get canvas and WebGL context
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl2", {
            alpha: false,
        })!;
        
        // Flip Y-axis for texture coordination
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

        // Initialize content (load textures)
        await Content.initialize(this.gl);

        // Create sprite renderer
        this.spriteRenderer = new SpriteRenderer(this.gl, this.canvas.width, this.canvas.height);
        await this.spriteRenderer.initialize();
    }

    /**
     * Main drawing loop
     * @param timestamp Current timestamp for animation frame
     */
    public draw(timestamp: number): void {
        // Calculate and display FPS
        this.frameCount++;
        if (timestamp >= this.lastFpsUpdate + 1000) {
            const fps = this.frameCount;
            this.fpsCounter.textContent = `FPS: ${fps}`;
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
        }

        // Move sprites based on keyboard input
        this.moveSprites();

        // Set up viewport and clear color
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.8, 0.8, 0.8, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Begin sprite rendering
        this.spriteRenderer.begin();

        // Render each sprite
        this.renderableSprites.forEach(renderableSprite => {
            const { sprite, position, rotation, rotationOrigin, rotationSpeed } = renderableSprite;
            
            // Update sprite position
            sprite.drawRect.x = position[0];
            sprite.drawRect.y = position[1];

            // Update rotation
            renderableSprite.rotation += rotationSpeed;

            // Draw sprite with source rectangle and rotation
            this.spriteRenderer.drawSpriteSource(
                sprite.texture,
                sprite.drawRect,
                sprite.sourceRect,
                undefined,
                renderableSprite.rotation,
                rotationOrigin
            );
        });

        // End sprite rendering
        this.spriteRenderer.end();

        // Request next animation frame
        window.requestAnimationFrame((ts) => this.draw(ts));
    }
}