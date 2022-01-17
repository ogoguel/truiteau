class Water extends FXBase {
    centerX: number
    centerY: number
    nb: number
    radius: number
    speed: number
    currentRadius: number
    minAngle: number
    maxAngle: number
    verticalSpeed: number
    horizontalSpeed: number
    noiseSeed: number
    noiseFrameCount: number
    percentageCenterX: number
    color: number

    constructor(_parent: FXBase, _centerX: number, _centerY: number, _radius: number, _minAngle: number, _maxAngle: number, _speed: number, _nb: number, _lifeTime: number, _delay: number, _horizontalSpeed: number, _verticalSpeed: number, _color: number) {
        super()
        super.init(_parent, _lifeTime, _delay)

        let b = GameController.instance.getBorders(_centerY)
        this.percentageCenterX = (_centerX - b[0]) / (b[1] - b[0])
        this.centerY = _centerY
        this.radius = _radius
        this.currentRadius = 0
        this.speed = _speed * 30
        this.nb = _nb
        this.minAngle = _minAngle
        this.maxAngle = _maxAngle
        this.verticalSpeed = _verticalSpeed + 0.5
        this.horizontalSpeed = _horizontalSpeed
        this.noiseSeed = Math.random()
        this.noiseFrameCount = 0
        this.color = _color
    }

    public onDestroy() {
        super.onDestroy()
    }

    public update() {
        let r = this.currentLife / this.speed
        let noiseGenerator = GameController.instance.getNoiseGenerator()
        this.currentRadius = this.radius * r
        this.centerY += this.verticalSpeed
        let b = GameController.instance.getBorders(this.centerY)
        this.centerX = (b[1] - b[0]) * this.percentageCenterX + b[0]
        this.noiseFrameCount++
    }

    public paint() {
        for (let i = 0; i < this.nb; i++) {
            let angle = i / this.nb * (this.maxAngle - this.minAngle) + this.minAngle
            let rad = angle / 360 * 2 * Math.PI
            let x = this.centerX + this.currentRadius * Math.cos(rad)
            let y = this.centerY + this.currentRadius * Math.sin(rad)

            let b = GameController.instance.getBorders(y)
            if (x<b[0] || x > b[1]) {
                continue
            }

            screen.setPixel(x, y - scene.cameraTop(), this.color);
        }
    }
}
