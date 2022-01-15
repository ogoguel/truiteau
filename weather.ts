
enum WeatherFX {
    NONE,
    CURRENT
}

class Weather {
    protected weather: WeatherFX
    constructor() {
        this.weather = WeatherFX.NONE;
    }

    public setWeather(_weather: WeatherFX) {
        this.weather = _weather
    }

    public update() {
        switch (this.weather) {
            case WeatherFX.CURRENT:
                let rain = Math.random()
                if (rain < 0.5) {
                    return
                }
                let y = scene.cameraTop() - 40 + Math.randomRange(0, scene.screenHeight())
                let b = GameController.instance.getBorders(y)
                let x = Math.randomRange(b[0] + 4, b[1] - 4)

                GameController.instance.addFX(
                    new Water(null, x, y,
                        Math.random() * 2 + 2, // radius
                        0, 360,
                        Math.random() * 2 + 2, //speed
                        Math.randomRange(10, 20), // nb
                        Math.random() + 0.5, // lifetime
                        0, // delay
                        0.5,
                        0,
                        9)
                )

                break;
            case WeatherFX.NONE:
                break
        }
    }
}