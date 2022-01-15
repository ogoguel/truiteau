enum GameState {
    SPLASH,
    TITLE,
    WAITING,
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
    protected fx: FX
    public static instance: GameController

    public constructor() {
        // singleton
        GameController.instance = this

        this.state = GameState.SPLASH;
        this.title = sprites.create(projectImages.Truiteau_Cover_128, SpriteKind.Food);
        this.random = new Random(Math.random())
        this.noiseGenerator = this.random.makeNoise2D()
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

        switch (_state) {
            case GameState.TITLE:
                this.title.setFlag(SpriteFlag.Invisible, false);
                this.terrain.showTerrain(false)
                this.obstacles.showObstacles(false)
                this.camera.defaultCamera();
                this.player.showPlayer(false);
                break
            case GameState.WAITING:
                this.title.setFlag(SpriteFlag.Invisible, true);
                this.terrain.showTerrain(true)
                // always generate same obstacle ... or not ?
                // this.random.setSeed(2)
                this.random.setSeed(Math.random())
                this.obstacles.addObstacles(4); // difficulty 
                this.obstacles.showObstacles(true)
                this.obstacles.move(false)
                this.enemies.addEnemies(4)
                this.enemies.showEnemies(true)
                this.camera.defaultGamePosition();
                this.player.resetPosition();
                this.player.showPlayer(true);
                this.statusBar.show(false)
                break
            case GameState.PLAYING:
                this.player.startGame();
                this.camera.setMovingSpeed(1);
                this.obstacles.move(true)
                this.weather.setWeather(WeatherFX.CURRENT);
                this.statusBar.show(true)
                break
            case GameState.GAMEOVER:
            case GameState.WINNER:
                this.player.endGame(_state == GameState.WINNER);
                this.camera.setMovingSpeed(0);
                this.obstacles.move(false)
                this.weather.setWeather(WeatherFX.NONE);
                break
        }
    }

    protected nextState() {
        switch (this.state) {
            case GameState.TITLE:
                this.setState(GameState.WAITING);
                break;
            case GameState.WAITING:
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
        // must be first
        this.camera.update();

        this.terrain.update();
        this.player.update();
        this.weather.update();
        this.obstacles.update();
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

    public getOverlappingObstacle(_player: Sprite): Sprite {
        return this.obstacles.getOverlappingObstacle(_player)
    }

    public getOverlappingEnemy(_player: Sprite): Sprite {
        return this.enemies.getOverlappingEnemy(_player)
    }

    public setStatusBar(_percentage: number) {
        this.statusBar.setValue(_percentage);
    }

    public setProgressBar(_percentage: number) {
        this.statusBar.setDistance(_percentage);
    }

    public gameOver() {
        this.setState(GameState.GAMEOVER);
    }

    public win() {
        this.setState(GameState.WINNER);
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