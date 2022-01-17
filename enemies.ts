enum EnemyType {
    GUARD,
    BEAR
}

enum EnemySide {
    LEFT,
    RIGHT
}

class Enemy {
    public sprite: Sprite
    public cauchtImg: Image
    public enemyType : EnemyType
    public enemySide: EnemySide
}

class Enemies {
    protected enemyImgs: Image[]
    protected enemyTypes: EnemyType[]
    protected enemySides: EnemySide[]
    protected enemies: Enemy[]
    protected isMoving: boolean
    protected moveCount: number

    constructor() {
        this.enemyImgs = [
            projectImages.guard_idle,
            projectImages.guard_catch,
            projectImages.bear_small_up,
            projectImages.bear_small_down,
            projectImages.guard_idle_right,
            projectImages.guard_catch_right,
        ]
        this.enemyTypes = [
            EnemyType.GUARD,
            EnemyType.BEAR,
            EnemyType.GUARD
        ]
        this.enemySides = [
            EnemySide.LEFT,
            EnemySide.RIGHT,
            EnemySide.RIGHT
        ]
        this.isMoving = false
        this.enemies = []
        this.moveCount = 0
    }

    // density per screen
    public addEnemies(_density: number) {
        for (let o of this.enemies) {
            o.sprite.destroy()
        }
        this.enemies = []
        let height = GameController.instance.getTerrainDimension()[1]
        for (let y = screen.height; y < height - screen.height; y++) {

            let b = GameController.instance.getBorders(y)
            let idx = Math.floor(GameController.instance.nextRandom() * this.enemyTypes.length) 
            let left = (this.enemySides[idx] == EnemySide.LEFT)
            let x = left ? b[0] : b[1]
            
            let img = this.enemyImgs[idx*2]
            if (x - img.width / 2 > 0) {
                let enemy = sprites.create(img, SpriteKind.Enemy);

                if (this.enemyTypes[idx]==EnemyType.BEAR) {
                    x -= img.width/4
                }

                enemy.setPosition(x, y)
                let obj = new Enemy()
                obj.sprite = enemy
                obj.cauchtImg = this.enemyImgs[idx * 2+1]
                obj.enemySide = this.enemySides[idx]
                obj.enemyType = this.enemyTypes[idx]

                this.enemies.push(obj)
            }
            y += (GameController.instance.nextRandom() + 1) * 75/2
        }
    }

    public showEnemies(_show: boolean) {
        for (let o of this.enemies) {
            o.sprite.setFlag(SpriteFlag.Invisible, !_show)
        }
    }

    public getOverlappingEnemy(_player: Sprite): Sprite {
        for (let o of this.enemies) {
            if (!GameController.instance.isOnScreen(o.sprite)) {
                continue
            }
            if (o.sprite.kind() != SpriteKind.Enemy) {
                continue;
            }
            if (o.sprite.overlapsWith(_player)) {
                o.sprite.setKind(SpriteKind.Food)
                o.sprite.setImage(o.cauchtImg)
                return o.sprite
            }

            if ( o.sprite.y > (_player.y + _player.height / 2)) {
                o.sprite.setKind(SpriteKind.Food)
                o.sprite.setImage(o.cauchtImg)
                return null
            }
  
        }
        return null
    }

    public move(_move: boolean) {
        this.isMoving = _move
        this.moveCount = 0
    }

    public update() {
        if (!this.isMoving) {
            return;
        }
        this.moveCount++
    }
}
