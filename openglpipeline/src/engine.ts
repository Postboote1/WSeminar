
import { Content } from "./content";
import { Rect } from "./rect";
import { SpriteRenderer } from "./sprite-renderer";

export class Engine {
    private canvas!: HTMLCanvasElement;
    private gl!: WebGL2RenderingContext;
    
    private spriteRenderer!: SpriteRenderer;

    private x = 10;
    private y = 10;
    constructor() {

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

        this.spriteRenderer.drawSprite(Content.playerTexture, new Rect(this.x,this.y,100, 100));

        //how big the sprite is
        

        //for (let i = 0; i < 100; i++) {
        //    this.spriteRenderer.drawSprite(Content.playerTexture, new Rect(
        //        Math.random() * this.canvas.width,
        //        Math.random() * this.canvas.height,
        //        10, 10));//how big the sprite is
        //}
        //for (let i = 0; i < 100; i++) {

        //    this.spriteRenderer.drawSprite(Content.planet, new Rect(
        //        Math.random() * this.canvas.width,
        //        Math.random() * this.canvas.height,
        //        10, 10));
        //}
        this.spriteRenderer.end();


        // start game loop 
        window.requestAnimationFrame(() => this.draw());
    }

}