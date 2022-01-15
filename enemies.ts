class Enemy {
    public sprite: Sprite
    public cauchtImg: Image
}

class Enemies {
    protected enemyImgs: Image[]
    protected enemies: Enemy[]
    protected isMoving: boolean
    protected moveCount: number

    constructor() {
        this.enemyImgs = [
            projectImages.guard_idle,
            projectImages.guard_catch,
            projectImages.guard_idle_right,
            projectImages.guard_catch_right,
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
        for (let y = 0; y < height - screen.height; y++) {

            let b = GameController.instance.getBorders(y)
            let left = GameController.instance.nextRandom() < 0.5
            let x = left ? b[0] : b[1]
            let idx = left ? 0 : 2
            let img = this.enemyImgs[idx]
            if (x - img.width / 2 > 0) {
                let enemy = sprites.create(img, SpriteKind.Enemy);
                enemy.setPosition(x, y)
                let obj = new Enemy()
                obj.sprite = enemy
                obj.cauchtImg = this.enemyImgs[idx + 1]
                this.enemies.push(obj)
            }
            y += (GameController.instance.nextRandom() + 1) * 75
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

            if (o.sprite.y > (_player.y + _player.height / 2)) {
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
