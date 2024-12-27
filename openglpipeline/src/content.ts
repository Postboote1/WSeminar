import { Texture } from "./texture";

//class to hold game content assets
export class Content {

    public static playerTexture: Texture;
    public static planet: Texture;

    public static async initialize(gl: WebGL2RenderingContext){

        this.playerTexture = await Texture.loadTexture(gl, "assets/png/ship_1.png")
        this.planet = await Texture.loadTexture(gl, "assets/png/planet_3.png")
    }
}