class Camera {
    protected y: number
    protected x: number
    protected speedY: number
    protected isMoving: boolean

    constructor() {
        this.defaultCamera()
    }

    public defaultCamera() {
        this.x = screen.width / 2
        this.y = screen.height / 2
        this.speedY = 0;
    }

    public defaultGamePosition() {
        this.y = GameController.instance.getStartPosition();
        this.x = screen.width / 2
        this.speedY = 0;
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

    public setMovingSpeed(_speed: number) {
        this.speedY = _speed
    }

    public update() {
        this.y = this.y - this.speedY;
        scene.centerCameraAt(this.x, this.y);
    }
}
