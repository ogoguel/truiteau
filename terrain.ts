 
class Terrain {

    // Top = 0
    // Bottom = MAX_HEIGHT-1
    // Game Start @ Bottom


    // Z Order
    // Fish 1
    // Obstacles 0
    // Decor -1000 -5000
    // Terrain - 10000
    // Splash -2

    protected backgroundImg: Image;
    protected backgroundSprite: Sprite;
    protected left: number[]
    protected right: number[]
    protected trees: Sprite[]
    protected treeImgs: Image[]
    protected fishAnimations: Image[][]
    protected fishes: Sprite[]

    constructor() {
        this.treeImgs = [
            assets.image`treeSmallPine`,
            assets.image`forestTree1`,
            assets.image`forestTree2`,
            assets.image`logTree`,
        ]
        this.fishAnimations = [
            assets.animation`fishLeft`,
            assets.animation`fishRight`,
        ]
    }

    // must be an int
    public getBorders(_line: number): number[] {
        let index = Math.floor(_line)
        return [this.left[index], this.right[index]]
    }

    // < 0, on left bank, == 0 on river, >0 on right bank
    public isOnRiver(_sprite: Sprite): number {
        let borders = this.getBorders(Math.floor(_sprite.y))
        let leftBorder = _sprite.x - _sprite.width / 2 - borders[0]
        if (leftBorder < 0)
            return leftBorder
        let rightBorder = borders[1] - (_sprite.x + _sprite.width / 2)
        if (rightBorder < 0)
            return -rightBorder
        return 0
    }

    public getTerrainDimension(): number[] {
        return [this.backgroundImg.width, this.backgroundImg.height]
    }

    // _density per screen
    public addTrees(_density: number) {
        this.trees = []
        let nbTrees = _density * this.backgroundImg.height / screen.height

        for (let t = 0; t < nbTrees; t++) {
            let treeImg = this.treeImgs[Math.floor(GameController.instance.nextRandom() * this.treeImgs.length)]
            let tree = sprites.create(treeImg, SpriteKind.Food);
            let y = Math.floor(GameController.instance.nextRandom() * this.backgroundImg.height);

            tree.z = -5000 + y
            let x: number
            if (GameController.instance.nextRandom() > 0.5) {
                x = this.left[y] - tree.width / 2 - GameController.instance.nextRandom() * 100
            }
            else {
                x = this.right[y] + tree.width / 2 + GameController.instance.nextRandom() * 100
            }

            tree.setPosition(x, y)
            this.trees.push(tree)
        }
    }

    public addSnow(_density: number) {
        let h = this.backgroundImg.height
        for (let y = 0; y < h; y++) {
            let nbSnowPerLine = ((GameController.instance.nextRandom() / 10) + 1) * (h - y) / 10
            let border = this.getBorders(Math.floor(y));
            for (let x = 0; x < nbSnowPerLine; x++) {
                let right = GameController.instance.nextRandom() > 0.5;
                let pos
                if (right) {
                    pos = GameController.instance.nextRandom() * (screen.width - border[1]) + border[1]
                } else {
                    pos = GameController.instance.nextRandom() * border[0]
                }
                this.backgroundImg.setPixel(pos, y, 1)
            }
        }
    }

    public showTerrain(_show: boolean) {
        this.backgroundSprite.setFlag(SpriteFlag.Invisible, !_show);
        for (let t of this.trees) {
            t.setFlag(SpriteFlag.Invisible, !_show)
        }

        for(let f of this.fishes) {
            f.setFlag(SpriteFlag.Invisible, !_show)
        }
        // Use transparent for water
        scene.setBackgroundColor(_show ? 8 : 0);
    }

    public generate(_height: number) {
        this.backgroundImg = image.create(screen.width, _height)
        this.backgroundImg.fill(0)

        this.left = []
        this.right = []

        let noiseGenerator = GameController.instance.getNoiseGenerator()
        let width = this.backgroundImg.width
        let height = this.backgroundImg.height

        let leftCenter = screen.width / 2
        let rightCenter = screen.width / 2

        let deltaCenter = 0
        let deltaWidth = 0
        
        let lPerlin = 0
        while (noiseGenerator(lPerlin,0)<0.8) {
            lPerlin +=0.01
        }
        let rPerlin = lPerlin+0.1
        while (noiseGenerator(rPerlin,0) < 0.8) {
            rPerlin += 0.01
        }

        console.log(rPerlin+" "+lPerlin)

        for (let y = 0; y < height; y++) {

            deltaCenter = (screen.width / 3 * y/height)+10
            deltaWidth = screen.width / 4
        
            let perlinY = y / (screen.height);
            let leftX = leftCenter - deltaCenter + (noiseGenerator(lPerlin, perlinY)) * deltaWidth
            let rightX = rightCenter + deltaCenter + (noiseGenerator(rPerlin, perlinY)) * deltaWidth;

            if (leftX < 0)
                leftCenter++;
            if (rightX > screen.width)
                rightCenter--;
            if (leftX > (rightX - 50))
                leftCenter--;

            this.left[y] = leftX
            this.right[y] = rightX

            let color = 7
            this.backgroundImg.drawLine(0, y, leftX, y, color)
            this.backgroundImg.drawLine(rightX, y, screen.width - 1, y, color)
        }
        this.backgroundSprite = sprites.create(this.backgroundImg);

        // always behind
        this.backgroundSprite.z = -10000;
        // move to the bottom (position is relative to its center)
        this.backgroundSprite.y = height - height / 2;

        this.fishes = []
        for(let f=0;f<10;f++) {
            let img = this.fishAnimations[Math.floor(Math.random()*this.fishAnimations.length)]
            let s = sprites.create(img[0],SpriteKind.Food)
            animation.runImageAnimation(s, img,250,true)
            let y = Math.randomRange(0,screen.height/2)
            s.y = y
            s.x = this.left[y]+4+Math.randomRange(0,this.right[y]-this.left[s.y]-s.width)
            this.fishes[f]=s
        }  
        
    }

    public update() {
        // animated terrain?
    }
}