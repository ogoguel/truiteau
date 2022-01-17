enum ObstacleType {
    LOG,
    BONUS
}
class Obstacle {
    public sprite: Sprite
    public trail: Trail
    public centerRatio: number
    public obstacleType: ObstacleType
}

class Obstacles {
    protected obstacleImgs: Image[]
    protected obstacleTypes: ObstacleType[]
    protected obstacleProba: number[]
    protected obstacles: Obstacle[]
    protected isMoving: boolean
    protected moveCount: number
    protected distribution : number[]

    constructor() {
        this.obstacleImgs = [
            assets.image`log`,
            assets.image`log1`,
            assets.image`marismall0`,
            assets.image`canadared0`
        ]
        this.obstacleTypes = [
            ObstacleType.LOG,
            ObstacleType.LOG,
            ObstacleType.BONUS,
            ObstacleType.BONUS,
        ]
        this.obstacleProba = [
            1,
            1,
            0.05,
            0.05
        ]
        this.isMoving = false
        this.obstacles = []
        this.moveCount = 0

        this.distribution = []
        let max = 100
        let idx = 0
        for (let i = 0; i < this.obstacleProba.length;i++) {
            let nb = this.obstacleProba[i] * max
            for(let j=0;j<nb;j++) {
                this.distribution[idx++]= i;
            }
        }
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
            let idx = this.distribution[Math.floor(GameController.instance.nextRandom() * this.distribution.length)]
            let obstacleImg = this.obstacleImgs[idx]
            let obstacle = sprites.create(obstacleImg, SpriteKind.Enemy);
            // pas d'obstacle sur le 1er ecran ni le dernier
            let y 

            // check that there no obstacles on the same line
            let check
            do {
                y = screen.height + Math.floor(GameController.instance.nextRandom() * (height - screen.height * 2));
                check = false
                for(let other of this.obstacles) {
                    if (other.sprite.y >= (y - obstacleImg.height) && other.sprite.y < (y+obstacleImg.height)) {
                        check = true
                    }
                }
            } while(check)
          
            let b = GameController.instance.getBorders(y)
            let x = (b[1] - b[0] - 10) * GameController.instance.nextRandom()
            if (x > 0) {
                obstacle.setPosition(x + b[0], y)

                let obj = new Obstacle()
                obj.sprite = obstacle
                obj.obstacleType = this.obstacleTypes[idx] 
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

    public getOverlappingObstacle(_player: Sprite): Obstacle {
        for (let o of this.obstacles) {
            if (!GameController.instance.isOnScreen(o.sprite)) {
                continue
            }
            if (o.sprite.kind() != SpriteKind.Enemy) {
                continue;
            }
            if (o.sprite.overlapsWith(_player)) {
                o.sprite.setKind(SpriteKind.Food)
                if (o.obstacleType == ObstacleType.BONUS) {
                    o.sprite.setFlag(SpriteFlag.Invisible,true)
                }else {
                    o.sprite.setKind(SpriteKind.Food)
                }
                return o
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
            if (o.trail == null && o.obstacleType == ObstacleType.LOG) {
                o.trail = new Trail(null, o.sprite, 4, 0, -10, o.sprite.width/2, 0.5, 0.5, 1)
                GameController.instance.addFX(o.trail)
            }

            let y = o.sprite.y
            if (o.obstacleType == ObstacleType.LOG) {
                y +=  (noiseGenerator(idx, this.moveCount / 120) + 1) * 2
            }
            else {
                y += 1
            }
            let b = GameController.instance.getBorders(Math.floor(y))
            let x = (b[1] - b[0]) * o.centerRatio + b[0]// + noiseGenerator(idx, this.moveCount / 120) * 2

            if (x < b[0]) {
                x = b[0]
            }
            else if (x > b[1]) {
                x = b[1]
            }

            let canMove = true
            for(let other of this.obstacles) {
                if (other == o || !GameController.instance.isOnScreen(other.sprite) || other.obstacleType == ObstacleType.BONUS) {
                    continue
                }
                if (other.sprite.overlapsWith(o.sprite) && other.sprite.y < o.sprite.y) {
                    canMove = false
                }
            }

            if (canMove) {
                o.sprite.setPosition(x, y)
            }
       
        }
    }
}
