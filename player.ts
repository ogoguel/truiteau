enum DeathEnum {
    OBSTACLE,
    BORDER,
    JUMP,
    OFFSCREEN,
    ENEMY
}

enum PlayerState {
    IDLE,
    WAITING,
    SWIMMING,
    JUMPING,
    EVADING,
    DEAD,
    WON
}

class Player {
    protected sprite: Sprite
    protected jumpingSprite: Sprite
    protected splash: Sprite
    protected currentSpeed: number
    protected energy: number
    protected trail: Trail
    protected jumpingFrame: number
    protected state: PlayerState
    protected frameCount: number
    protected death: DeathEnum

    constructor() {
        this.sprite = sprites.create(swimmingFish[0], SpriteKind.Player)
        this.jumpingSprite = sprites.create(img`.`, SpriteKind.Food)
        this.jumpingSprite.setFlag(SpriteFlag.Invisible, true)
        this.sprite.setFlag(SpriteFlag.Invisible, true)
        this.jumpingSprite.z = 1
        this.sprite.z = 1
        this.splash = sprites.create(img`.`, SpriteKind.Food)
        this.currentSpeed = 1;
        this.state = PlayerState.IDLE
        this.frameCount = 0;
    }

    public showPlayer(_show: boolean) {
        this.sprite.setFlag(SpriteFlag.Invisible, !_show)
        this.jumpingSprite.setFlag(SpriteFlag.Invisible, !_show)
    }

    public resetPosition() {
        this.talk("SPACE TO START", 5000);
        let y = GameController.instance.getStartPosition()
        let borders = GameController.instance.getBorders(y);
        let center = borders[0] + (borders[1] - borders[0]) / 2
        this.sprite.setPosition(center, y);
        this.state = PlayerState.IDLE
    }

    setState(_state: PlayerState) {
        if (_state == this.state) {
            return
        }

        this.state = _state

        this.jumpingSprite.setFlag(SpriteFlag.Invisible, this.state != PlayerState.JUMPING && this.state != PlayerState.EVADING)
        this.sprite.setFlag(SpriteFlag.Invisible, this.state == PlayerState.JUMPING || this.state == PlayerState.EVADING)
        switch (this.state) {
            case PlayerState.JUMPING:
            case PlayerState.EVADING:
                controller.moveSprite(this.sprite, 0, 0)
                if (this.state == PlayerState.EVADING) {
                    this.jumpingFrame = jumpingSmall.length * 2
                    music.smallCrash.play()
                }
                else {
                    music.zapped.play()
                    this.jumpingFrame = jumpingFish.length * 2;
                }
                this.sprite.vx = 0
                this.sprite.vy = 0
                this.sprite.ax = 0
                this.sprite.ay = 0
                this.trail.isGenerating = false
                break
            case PlayerState.SWIMMING:
                controller.moveSprite(this.sprite, 80, 80)
                this.trail.isGenerating = true
                break
            default:
                controller.moveSprite(this.sprite, 0, 0)
        }
    }

    public startGame() {
        this.talk("GO", 1000);
        this.energy = 1;
        this.trail = new Trail(null, this.sprite, 20, 0, 10, 2, 1, 1)
        GameController.instance.addFX(this.trail)
        this.setState(PlayerState.SWIMMING);
        music.buzzer.play()
    }

    public endGame(_hasWon: boolean) {
        if (_hasWon) {
            this.setState(PlayerState.WON);
            music.powerUp.play()
            this.talk("BRAVO : " + Math.floor(this.energy * 100), 5000);
        } else {
            this.setState(PlayerState.DEAD);
            music.wawawawaa.play()
            this.talk("OUCH!", 5000);
        }

        GameController.instance.removeFX(this.trail)
        this.trail = null
    }

    protected talk(_message: string, _delay: number) {
        this.sprite.sayText(_message, _delay, false, 1, 2);
        this.jumpingSprite.sayText(_message, _delay, false, 1, 2);
    }

    public onButtonPressed() {
        if (this.state != PlayerState.SWIMMING) {
            return;
        }
        this.setState(PlayerState.JUMPING);
    }

    removeEnergy(_amount: number, _potentialDeath: DeathEnum): boolean {
        this.energy -= _amount
        if (this.energy < 0) {
            this.death = _potentialDeath
            GameController.instance.gameOver()
            return true
        }
        else {
            return false
        }
    }

    swim() {
        // collision with the borders
        let diff = GameController.instance.isOnRiver(this.sprite)
        this.sprite.x -= diff
        if (this.removeEnergy(Math.abs(diff) / 50, DeathEnum.BORDER)) {
            return
        }

        // obstacles
        let obstacle = GameController.instance.getOverlappingObstacle(this.sprite)
        if (obstacle) {
            if (this.removeEnergy(0.2, DeathEnum.OBSTACLE)) {
                return
            }
            this.setState(PlayerState.EVADING)
        }

        // enemies
        let enemy = GameController.instance.getOverlappingEnemy(this.sprite)
        if (enemy) {
            let caught = Math.random() < 0.5
            if (caught) {
                this.death = DeathEnum.ENEMY
                this.sprite.setPosition(enemy.x, enemy.y)
                GameController.instance.gameOver()
            }
            return
        }

        // animation
        this.sprite.setImage(swimmingFish[(this.frameCount / 3) % swimmingFish.length])
    }

    jump() {
        this.jumpingFrame--;

        if (this.jumpingFrame == 0) {
            this.setState(PlayerState.SWIMMING);
            let diff = GameController.instance.isOnRiver(this.sprite)
            if (this.removeEnergy(Math.abs(diff), DeathEnum.JUMP)) {
                return
            }
        }
        if (this.state == PlayerState.JUMPING) {
            this.sprite.y -= 3.5
            this.jumpingSprite.setImage(jumpingFish[(this.jumpingFrame / 2) % jumpingFish.length])
        } else {
            this.sprite.y -= 2.5
            this.jumpingSprite.setImage(jumpingSmall[(this.jumpingFrame / 2) % jumpingSmall.length])
        }
        this.jumpingSprite.setPosition(this.sprite.x, this.sprite.y)
    }

    public update() {
        this.frameCount++;
        if (this.state == PlayerState.IDLE) {
            return
        }

        if (this.state == PlayerState.WON) {
            return
        }

        if (this.state == PlayerState.DEAD) {
            if (this.death == DeathEnum.ENEMY) {

            }
            else if (this.death == DeathEnum.JUMP) {
                this.sprite.setImage(swimmingFish[(this.frameCount / 3) % swimmingFish.length])
            }
            else {
                this.sprite.y += 0.5
                let diff = GameController.instance.isOnRiver(this.sprite)
                this.sprite.x -= diff
            }
            return
        }

        // current
        this.sprite.y += this.currentSpeed;

        // mode
        if (this.state == PlayerState.SWIMMING) {
            this.swim()
        }
        else {
            this.jump()
        }

        // offscreen
        let res = GameController.instance.isOnScreen(this.sprite)
        if (!res) {
            this.removeEnergy(0.1, DeathEnum.OFFSCREEN)
        }

        let cameraTop = GameController.instance.getCameraTargetLine() - screen.height / 2
        if (cameraTop < 0) {
            GameController.instance.win()
        }

        GameController.instance.setStatusBar(this.energy)
        let height = GameController.instance.getTerrainDimension()[1]
        let total = GameController.instance.getStartPosition()
        let distance = (total - cameraTop) / total
        GameController.instance.setProgressBar(distance)
    }

}
