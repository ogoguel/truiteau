class StatusBar {
    protected statusImg: Image;
    protected statusSprite: Sprite;
    protected progressSprite: Sprite;
    protected percentage: number
    protected distance: number
    protected margin: number

    constructor() {
        this.statusImg = image.create(8, 40)
        this.statusSprite = sprites.create(this.statusImg, SpriteKind.Food);
        this.statusSprite.setFlag(SpriteFlag.RelativeToCamera, true)
        let y = screen.height - this.statusSprite.height / 2 - 5;
        let x = screen.width - this.statusSprite.width / 2 - 5;
        this.statusSprite.setPosition(x, y)
        this.statusSprite.z = 10
        this.progressSprite = sprites.create(assets.image`arrow`, SpriteKind.Food)
        this.progressSprite.setFlag(SpriteFlag.RelativeToCamera, true)
        this.progressSprite.setPosition(x - 6, y)
        this.progressSprite.z = 10
        this.percentage = -1
        this.distance = -1
        this.margin = 2
        this.setValue(1)
    }

    public show(_show: boolean) {
        this.statusSprite.setFlag(SpriteFlag.Invisible, !_show);
        this.progressSprite.setFlag(SpriteFlag.Invisible, !_show);
    }

    public setDistance(_distance: number) {
        let dist = Math.clamp(0, 1, _distance)
        if (this.distance == dist) {
            return
        }
        this.distance = dist
        let delta = this.distance * (this.statusSprite.height)
        let topStatus = this.statusSprite.y + this.statusSprite.height / 2
        this.progressSprite.y = topStatus - delta
    }
    
    public setValue(_percentage: number,) {
        let p = Math.clamp(0, 1, _percentage)
        if (this.percentage == p) {
            return
        }
        this.percentage = p;

        this.statusImg.fill(10)
        let h = (1 - this.percentage) * (this.statusSprite.height - this.margin * 2);
        this.statusImg.fillRect(this.margin, this.margin + h, this.statusSprite.width - this.margin * 2, this.statusSprite.height - h - this.margin * 2, 2);
    }

    public update() {
    }
}
