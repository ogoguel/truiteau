 enum GameState {
    SPLASH,
    TITLE,
    WAITING,
    PRESENTATION,
    READY,
    PLAYING,
    GAMEOVER,
    WINNER
}

class GameController {
    protected terrain: Terrain
    protected state: GameState
    protected player: Player
    protected camera: Camera
    protected obstacles: Obstacles
    protected enemies: Enemies
    protected weather: Weather
    protected title: Sprite
    protected statusBar: StatusBar
    protected random: Random
    protected noiseGenerator: any
    protected gameSeed : number
    protected fx: FX
    
    public static instance: GameController

    public constructor() {
        // singleton
        GameController.instance = this

        this.state = GameState.SPLASH;
        this.title = sprites.create(projectImages.Truiteau_Cover_128, SpriteKind.Food);
        this.random = new Random(Math.random())
        this.noiseGenerator = this.random.makeNoise2D()
        this.gameSeed = Math.random()
    }

    public launchGame() {
        this.terrain = new Terrain();
        this.terrain.generate(screen.height * 15);
        this.terrain.addTrees(10)
        this.terrain.addSnow(100)
        this.obstacles = new Obstacles();
        this.enemies = new Enemies();
        this.player = new Player();
        this.camera = new Camera();
        this.weather = new Weather();
        this.statusBar = new StatusBar();

        this.fx = new FX();
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
            this.player.onButtonPressed();
            this.nextState();
        })

        this.setState(GameState.TITLE);
    }

    public getState(): GameState {
        return this.state
    }

    public setState(_state: GameState) {
        if (this.state == _state) {
            return;
        }
        this.state = _state;
        console.log("SetState:"+_state)
        switch (_state) {
            case GameState.TITLE:
                this.title.setFlag(SpriteFlag.Invisible, false);
                this.terrain.showTerrain(false)
                this.obstacles.showObstacles(false)
                this.camera.defaultCamera();
                this.player.showPlayer(false);
                this.statusBar.show(false)
                break
            case GameState.WAITING:
                this.title.setFlag(SpriteFlag.Invisible, true);
                this.terrain.showTerrain(true)
                // always generate same gameplay 
                this.random.setSeed(this.gameSeed)
                this.obstacles.addObstacles(4); // difficulty 
                this.obstacles.showObstacles(false)
                this.obstacles.move(false)
                this.enemies.addEnemies(4)
                this.camera.topGamePosition()
                this.statusBar.show(false)
                this.player.showPlayer(false);
                this.weather.setWeather(WeatherFX.CURRENT);
                this.enemies.showEnemies(false)
                break
            case GameState.PRESENTATION:  
                this.weather.setWeather(WeatherFX.NONE);
                this.statusBar.setValue(1)
                this.statusBar.show(true)
                this.camera.startPresentation()
                break
            case GameState.READY:
                this.camera.defaultGamePosition();
                this.camera.setMovingSpeed(0, 0)
                this.player.resetPosition();
                this.player.showPlayer(true);
                this.obstacles.showObstacles(true)
                this.enemies.showEnemies(true)
                this.enemies.move(false)
                this.obstacles.move(false)
                this.weather.setWeather(WeatherFX.CURRENT);
                break
            case GameState.PLAYING:
                this.player.startGame();
                this.camera.setMovingSpeed(1,0);
                this.obstacles.move(true)
                this.enemies.move(true)
                break
            case GameState.GAMEOVER:
            case GameState.WINNER:
                this.player.endGame(_state == GameState.WINNER);
                this.camera.setMovingSpeed(0,0);
                this.enemies.move(false)
                break
        }
    }

    protected nextState() {
        console.log(this.state)
        switch (this.state) {
            case GameState.TITLE:
                this.setState(GameState.WAITING);
                break;
            case GameState.WAITING:
                this.setState(GameState.PRESENTATION);
                break;
            case GameState.PRESENTATION:
                this.setState(GameState.READY);
                break;
            case GameState.READY:
                this.setState(GameState.PLAYING);
                break;
            case GameState.PLAYING:
                break;
            case GameState.WINNER:
            case GameState.GAMEOVER:
                this.setState(GameState.WAITING);
                break;
        }
    }

    public mainLoop() {
        this.camera.update();
        this.terrain.update();
        this.player.update();
        this.weather.update();
        this.obstacles.update();
        this.enemies.update();
        this.statusBar.update();
        this.fx.update();
    }

    public paint() {
        this.fx.paint()
    }

    // getters
    
    public getStartPosition() {
        return this.getTerrainDimension()[1] - screen.height / 2 - 1
    }

    public getBorders(_line: number) {
        return this.terrain.getBorders(_line)
    }

    public getTerrainDimension() {
        return this.terrain.getTerrainDimension()
    }

    public getCameraTargetLine() {
        return this.camera.getCameraTargetLine()
    }

    public isOnScreen(_sprite: Sprite) {
        return this.camera.isOnScreen(_sprite)
    }

    public isOnRiver(_sprite: Sprite): number {
        return this.terrain.isOnRiver(_sprite)
    }

    public getOverlappingObstacle(_player: Sprite): Obstacle {
        return this.obstacles.getOverlappingObstacle(_player)
    }

    public getOverlappingEnemy(_player: Sprite): Enemy {
        return this.enemies.getOverlappingEnemy(_player)
    }

    public setStatusBar(_percentage: number) {
        this.statusBar.setValue(_percentage);
    }

    public setProgressBar(_percentage: number) {
        this.statusBar.setDistance(_percentage);
    }

    public getPlayerPosition(): number[] {
        return this.player.getPlayerPosition()
    }

    public getKiller(): Enemy {
        return this.player.getKiller()
    }

    public gameOver() {
        this.setState(GameState.GAMEOVER);
    }

    public win() {
        this.setState(GameState.WINNER);
    }

    public presentationHasEnded() {
        this.nextState()
    }

    public getNoiseGenerator() {
        return this.noiseGenerator
    }

    public nextRandom() {
        return this.random.nextRandomNumber()
    }

    public addFX(_fx: FXBase) {
        this.fx.addFX(_fx)
    }

    public removeFX(_fx: FXBase) {
        this.fx.removeFX(_fx)
    }
}