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
    public trail: Trail
    public cauchtImg: Image
    public baseImg: Image
    public enemyType : EnemyType
    public enemySide: EnemySide
    public delta  : number
    public catchProba : number
    public hidePlayerOnKill : boolean
}

class Enemies {
    protected enemyImgs: Image[]
    protected enemyTypes: EnemyType[]
    protected enemySides: EnemySide[]
    protected enemyProbas: number[]

    protected enemies: Enemy[]
    protected isMoving: boolean
    protected moveCount: number
    public waterImg: Image

    constructor() {
        this.enemyImgs = [
            projectImages.guard_idle,
            projectImages.guard_catch,
            projectImages.guard_idle_right,
            projectImages.guard_catch_right,
            projectImages.bear_small_up_left,
            projectImages.bear_small_down_left,
            projectImages.bear_small_up,
            projectImages.bear_small_down,
        ]
        this.enemyTypes = [
            EnemyType.GUARD,
            EnemyType.GUARD,
            EnemyType.BEAR,
            EnemyType.BEAR,
           
        ]
        this.enemySides = [
            EnemySide.LEFT,
            EnemySide.RIGHT,
            EnemySide.LEFT,
            EnemySide.RIGHT
        ]
        this.enemyProbas = [
            0.25,
            0.25,
            0.8,
            0.8
        ]
        this.isMoving = false
        this.enemies = []
        this.moveCount = 0
    }

    // density per screen
    public addEnemies(_density: number) {
        for (let o of this.enemies) {
            GameController.instance.removeFX(o.trail)
            o.sprite.destroy()
        }
        this.enemies = []
        let height = GameController.instance.getTerrainDimension()[1]
        for (let y = screen.height; y < height - screen.height*2; y++) {

            let b = GameController.instance.getBorders(y)
            let idx = Math.floor(GameController.instance.nextRandom() * this.enemyTypes.length) 
            let left = (this.enemySides[idx] == EnemySide.LEFT)
            let x = left ? b[0] : b[1]
            
            let img = this.enemyImgs[idx*2]
            if (x - img.width / 4 > 0) 
            {
                let enemy = sprites.create(img, SpriteKind.Enemy);
                enemy.setPosition(x, y)
                let obj = new Enemy()
                obj.sprite = enemy
                obj.baseImg = img
                obj.cauchtImg = this.enemyImgs[idx * 2+1]
                obj.enemySide = this.enemySides[idx]
                obj.enemyType = this.enemyTypes[idx]
                obj.catchProba  = this.enemyProbas[idx]
                obj.delta = 0
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

    public getOverlappingEnemy(_player: Sprite): Enemy {
        for (let o of this.enemies) {
            if (!GameController.instance.isOnScreen(o.sprite)) {
                continue
            }
            if (o.sprite.kind() != SpriteKind.Enemy) {
                continue;
            }
            if (o.sprite.overlapsWith(_player)) {
                o.sprite.setKind(SpriteKind.Food)
                this.setImageWithWater(o, true)
                o.hidePlayerOnKill = ( o.enemyType == EnemyType.BEAR )
                return o
            }
            if (o.delta == 0 && o.sprite.y > (_player.y + _player.height / 2)) {
                this.setImageWithWater(o,true)
                return null
            }
        }
        return null
    }

    public move(_move: boolean) {
        this.isMoving = _move
        this.moveCount = 0
    }

    setImageWithWater(_enemy:Enemy,_caught:boolean) {
        let delta = _enemy.delta *0.4
        let img = (_caught?_enemy.cauchtImg:_enemy.baseImg).clone()
        img.fillRect(0, img.height - delta, img.width, delta, 0)
        _enemy.sprite.setImage(img)
    }

    addWaterFx(_enemy:Enemy) {
        if (_enemy.trail != null) {
            return
        }
        _enemy.trail = new Trail(null, _enemy.sprite, 4, 0, +10, _enemy.sprite.width, 0.5, 0.5, 1)
        GameController.instance.addFX(_enemy.trail)
    }

    public update() {
        this.moveCount++

        if (!this.isMoving) {
            let killer = GameController.instance.getKiller()
            if (killer != null && killer.enemyType == EnemyType.BEAR) {
                if ( (this.moveCount & 10) == 0) {
                    this.setImageWithWater(killer,true)
                } else {
                    this.setImageWithWater(killer, false)
                }
            }
            return;
        }

        let pos = GameController.instance.getPlayerPosition()
        for (let e of this.enemies) {
            if (!GameController.instance.isOnScreen(e.sprite)) {
                continue
            }
            if (e.sprite.kind() != SpriteKind.Enemy) {
                continue;
            }

            if (e.enemyType == EnemyType.BEAR) {
                // bear jumping on player
                if ( (e.sprite.x - pos[0]) < 40 && pos[1] < e.sprite.y && (e.sprite.y - pos[1] ) < 20  && e.delta < 10 ) {
                    e.delta ++
                    e.sprite.x +=  3 * ((e.enemySide == EnemySide.LEFT)?1:-1)
                    e.sprite.y += 1
                  
                    this.addWaterFx(e)

                    if ((e.delta & 4) != 0) {
                        this.setImageWithWater(e,true)
                    } else {
                        this.setImageWithWater(e, false)
                    }     
                }
            }
        }
    }
}
