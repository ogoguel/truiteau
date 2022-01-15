class FXBase {
    public life: number
    public currentLife: number
    public delay: number
    public parent: FXBase
    public isGenerating: boolean

    protected constructor() {

    }

    public init(_parent: FXBase, _life: number, _delay: number) {
        this.life = _life * 30
        this.currentLife = 0
        this.delay = _delay * 30
        this.parent = _parent
        this.isGenerating = true
    }
    // interface
    public update() { }
    public paint() { }
    public onDestroy() {
        if (this.parent != null) {
            this.parent.onChildDestroy(this)
        }
    }
    public onChildDestroy(_child: FXBase) {
        this.parent
    }
}

class FX {
    fxs: FXBase[]
    life: number[]
    currentLife: number[]

    constructor() {
        this.fxs = []
    }

    addFX(_fx: FXBase) {
        this.fxs.push(_fx)
    }

    removeFX(_fx: FXBase) {
        if (_fx == null) {
            return
        }
        _fx.onDestroy()
        this.fxs.removeElement(_fx)
    }

    public update() {
        for (let fx of this.fxs) {
            fx.delay--
            if (fx.delay > 0) {
                continue
            }

            fx.currentLife++
            if (fx.life != 0 && fx.currentLife > fx.life) {
                fx.onDestroy()
                this.fxs.removeElement(fx)
            }
            else {
                if (fx.isGenerating) {
                    fx.update()
                }
            }
        }
    }

    public paint() {
        for (let fx of this.fxs) {
            fx.paint()
        }
    }
}
