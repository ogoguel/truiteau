class TrailElement {
    x: number
    y: number
}

class Trail extends FXBase {
    source: Sprite
    startX: number
    startY: number
    max: number
    radius: number
    speed: number
    currentRadius: number
    nb: number
    elements: FXBase[]
    lastX: number
    lastY: number
    sourceDeltaX: number
    sourceDeltaY: number
    duration: number
    color: number

    constructor(_parent: FXBase, _source: Sprite, _max: number, _startX: number, _startY: number, _duration: number, _speed: number, _color: number) {
        super()
        super.init(_parent, 0, 0)
        this.startX = _startX
        this.startY = _startY
        this.max = _max
        this.nb = 0
        this.source = _source
        this.sourceDeltaX = 0
        this.sourceDeltaY = 0
        this.lastX = _source.x
        this.lastY = _source.y
        this.duration = _duration
        this.speed = _speed
        this.color = _color
        this.elements = []
        this.addElement()
    }

    public onChildDestroy(_child: FXBase) {
        this.elements.removeElement(_child)
    }

    public onDestroy() {
        super.onDestroy()
        for (let element of this.elements) {
            GameController.instance.removeFX(element)
        }
    }

    addElement() {
        let element = new Water(this, this.source.x, this.source.y + this.startY,
            7, // radius
            30, 150, //2, 160, // min/max angle
            this.speed, // speed
            this.max, // nb
            this.duration, // _lifetime
            0,
            -this.sourceDeltaX,
            0,
            this.color)

        GameController.instance.addFX(element)
    }

    public update() {
        this.sourceDeltaX = this.source.x - this.lastX
        this.sourceDeltaY = this.source.y - this.lastY
        this.lastX = this.source.x
        this.lastY = this.source.y
        if (Math.random() < 0.4) {
            this.addElement()
        }
    }
}
