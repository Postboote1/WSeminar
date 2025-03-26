import { Rect } from "./rect";
import { Sprite } from "./sprite";
import { Texture } from "./texture";

// Manages loading and storing sprite sheet and sprite information
export class Content 
{
    // Static texture for the sprite sheet
    private static spriteSheet: Texture;

    // Dictionary to store sprites by their names
    public static sprites: { [id:string] : Sprite }={};

    // Additional test texture
    public static testUvTexture: Texture;

    /**
     * Initialize content by loading textures and sprite sheet
     * @param gl WebGL rendering context
     */
    public static async initialize(gl: WebGL2RenderingContext)
    {
        // Load main sprite sheet texture
        this.spriteSheet = await Texture.loadTexture(gl, "assets/Spritesheet/sheet.png");
        
        // Load test texture for UV mapping
        this.testUvTexture = await Texture.loadTexture(gl, "assets/texture-mapping-test-image.jpg");

        // Process the sprite sheet XML to extract individual sprites
        await this.loadSpriteSheet(); 
    }

    /**
     * Parse sprite sheet XML to create individual sprite definitions
     */
    private static async loadSpriteSheet() 
    {
        // Fetch XML file describing sprite sheet
        const sheetXmlReq = await fetch("assets/Spritesheet/sheet.xml");
        const sheetXmlText = await sheetXmlReq.text();

        // Parse XML text into a document
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(sheetXmlText, "text/xml");

        // Iterate through each sprite subtexture in the XML
        xmlDoc.querySelectorAll("SubTexture").forEach((subTexture) => {
            // Extract sprite metadata
            const name = subTexture.getAttribute("name")!.replace(".png", "");
            const x = parseInt(subTexture.getAttribute("x")!);
            const y = parseInt(subTexture.getAttribute("y")!);
            const width = parseInt(subTexture.getAttribute("width")!);
            const height = parseInt(subTexture.getAttribute("height")!);

            // Create drawing rectangle (initial position at 0,0)
            const drawRect = new Rect(0, 0, width, height);
            
            // Create source rectangle from sprite sheet coordinates
            const sourceRect = new Rect(x, y, width, height);

            // Store sprite in sprites dictionary
            this.sprites[name] = new Sprite(this.spriteSheet, drawRect, sourceRect);
        });
    }

    /**
     * Get names of all loaded sprites
     * @returns Array of sprite names
     */
    public static getSpriteNames(): string[] {
        return Object.keys(this.sprites);
    }
}