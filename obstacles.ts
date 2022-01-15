class Obstacle {
    public sprite: Sprite
    public trail: Trail
    public centerRatio: number
}

class Obstacles {
    protected obstacleImgs: Image[]
    protected obstacles: Obstacle[]
    protected isMoving: boolean
    protected moveCount: number

    constructor() {
        this.obstacleImgs = [
            assets.image`log`,
            assets.image`log1`,
        ]
        this.isMoving = false
        this.obstacles = []
        this.moveCount = 0
    }

    // density per screen
    public addObstacles(_density: number) {

        for (let o of this.obstacles) {
            o.sprite.destroy()
            if (o.trail != null) {
                GameController.instance.removeFX(o.trail)
            }

        }
        this.obstacles = []

        let height = GameController.instance.getTerrainDimension()[1]
        let nbObstacles = _density * height / screen.height

        for (let t = 0; t < nbObstacles; t++) {
            let obstacleImg = this.obstacleImgs[Math.floor(Math.random() * this.obstacleImgs.length)]
            let obstacle = sprites.create(obstacleImg, SpriteKind.Enemy);
            // pas d'obstacle sur le 1er ecran
            let y = Math.floor(GameController.instance.nextRandom() * (height - screen.height * 1.2));

            let b = GameController.instance.getBorders(y)
            let x = (b[1] - b[0] - 10) * GameController.instance.nextRandom()
            if (x > 0) {
                obstacle.setPosition(x + b[0], y)

                let obj = new Obstacle()
                obj.sprite = obstacle
                obj.trail = null
                obj.centerRatio = x / (b[1] - b[0])
                this.obstacles.push(obj)
            }
        }
    }

    public showObstacles(_show: boolean) {
        for (let o of this.obstacles) {
            o.sprite.setFlag(SpriteFlag.Invisible, !_show)
            if (o.trail != null && !_show) {
                GameController.instance.removeFX(o.trail)
                o.trail = null
            }
        }
    }

    public getOverlappingObstacle(_player: Sprite): Sprite {
        for (let o of this.obstacles) {
            if (!GameController.instance.isOnScreen(o.sprite)) {
                continue
            }
            if (o.sprite.kind() != SpriteKind.Enemy) {
                continue;
            }
            if (o.sprite.overlapsWith(_player)) {
                o.sprite.setKind(SpriteKind.Food)
                return o.sprite
            }
        }
        return null
    }

    public move(_move: boolean) {
        this.isMoving = _move
        this.moveCount = 0

        if (!_move) {
            for (let o of this.obstacles) {
                if (o.trail != null) {
                    o.trail.isGenerating = false
                }
            }
        }
    }

    public update() {
        if (!this.isMoving) {
            return;
        }
        this.moveCount++

        let height = GameController.instance.getTerrainDimension()[1]
        let noiseGenerator = GameController.instance.getNoiseGenerator()

        let idx = 0
        for (let o of this.obstacles) {
            idx++
            if (!GameController.instance.isOnScreen(o.sprite)) {
                if (o.trail != null) {
                    GameController.instance.removeFX(o.trail)
                    o.trail = null
                }
                continue
            }
            if (o.trail == null) {
                o.trail = new Trail(null, o.sprite, 4, 0, -10, 0.5, 0.5, 1)
                GameController.instance.addFX(o.trail)
            }

            let y = o.sprite.y + (noiseGenerator(idx, this.moveCount / 120) + 1) * 2
            let b = GameController.instance.getBorders(Math.floor(y))
            let x = (b[1] - b[0]) * o.centerRatio + b[0]// + noiseGenerator(idx, this.moveCount / 120) * 2

            if (x < b[0]) {
                x = b[0]
            }
            else if (x > b[1]) {
                x = b[1]
            }
            o.sprite.setPosition(x, y)
        }
    }
}
