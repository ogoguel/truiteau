class Camera {
    protected y: number
    protected x: number
    protected speedY: number
    protected accelerationY: number
    protected presenting : boolean
 
    constructor() {
        this.defaultCamera()
    }

    public defaultCamera() {
        this.x = screen.width / 2
        this.y = screen.height / 2
        this.speedY = 0;
        this.accelerationY = 0
        this.presenting = false
    }

    public defaultGamePosition() {
        this.y = GameController.instance.getStartPosition();
        this.x = screen.width / 2
        this.speedY = 0;
        this.presenting = false
    }

    public topGamePosition() {
        this.y = screen.height / 2
        this.x = screen.width / 2
        this.speedY = 0;
        this.presenting = false
    }

    public getCameraTargetLine(): number {
        return this.y
    }

    public isOnScreen(_sprite: Sprite): boolean {
        let cameraBottom = this.y + screen.height / 2
        if (_sprite.y - _sprite.height / 2 > cameraBottom) {
            return false;
        }
        let cameraTop = this.y - screen.height / 2
        if ((_sprite.y + _sprite.height / 2) < cameraTop) {
            return false;
        }
        return true;
    }

    public setMovingSpeed(_speed: number, _acceleration:number) {
        this.speedY = _speed
        this.accelerationY = _acceleration
    }
    public startPresentation() {
     this.setMovingSpeed(-1, -0.1)
     this.presenting = true
    }

    public update() {
       let y = this.y - this.speedY;
      
        if (y < screen.height / 2) {
            y = screen.height / 2
        }
        
        if (this.y > GameController.instance.getStartPosition()) {
            y = GameController.instance.getStartPosition()
        }
        this.y = y
        this.speedY += this.accelerationY

        let height = GameController.instance.getTerrainDimension()[1]
        let total = GameController.instance.getStartPosition()
        let distance = (total - this.y) / total
        GameController.instance.setProgressBar(distance)

        scene.centerCameraAt(this.x,this.y );

        if (this.presenting) {
            console.log(this.y)
            if (this.y == GameController.instance.getStartPosition()) {
                this.presenting = false
                GameController.instance.presentationHasEnded()
            }
        }
    }
}
